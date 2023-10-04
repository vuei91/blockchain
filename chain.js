const { BN } = require("bn.js");
const Block = require("./block");
const MessageType = require("./msg");

class Chain {
  /**
   * 체인 인스턴스 초기화 값
   */
  constructor() {
    this.blocks = [Block.getGenesis()]; // 블록 모이는 곳
    this.mempool = []; // tx 모이는 곳
  }
  /**
   * 멤풀에 트랜잭션 추가
   * @param {object} tx 트랜잭션
   */
  addTx(tx) {
    this.mempool.push(tx);
  }
  /**
   * 체인에 블록 추가
   * @param {Block} block 블록
   */
  addBlock(block) {
    const lastBlock = this.getLastBlock();
    // 블록 유효성 검증 진행
    if (this.isValidBlock(lastBlock, block)) {
      this.blocks.push(block);
      return true;
    } else {
      console.error("유효하지 않은 블록입니다");
      return false;
    }
  }
  slowResolve() {
    return new Promise((res) => setTimeout(res.bind(), 0));
  }
  /**
   * 채굴
   */
  async mining() {
    console.log("채굴 시작!");
    // 코인베이스 트랜잭션
    const coinbaseTx = { from: "COINBASE", to: "MINER", value: 50 };
    // 트랜잭션 리스트를 만듦 - Body
    const txList = [coinbaseTx, ...this.mempool];
    // 멤풀을 비워줌
    this.mempool = [];
    // 마지막(최신) 블록을 가져옴
    const lastBlock = this.getLastBlock();
    // 새로운 블록 생성
    const newBlock = new Block(lastBlock, txList);
    // 새로운 블록 난이도 셋팅
    newBlock.difficulty = this.getDifficulty(lastBlock.difficulty);
    // 타겟(목표값) 조회
    const target = this.getTarget(newBlock.difficulty);
    // 목표값과 해시값을 비교하여 해시퍼즐 정답을 만듦
    while (!(Block.createBlockHash(newBlock) <= target)) {
      newBlock.nonce++;
      await this.slowResolve();
    }
    // 해시퍼즐 정답을 만든 해시를 기존 블록에 셋팅
    newBlock.hash = Block.createBlockHash(newBlock);
    // 새로만든 블록 출력
    console.log(newBlock);
    console.log("채굴 성공!");
    // 블록체인에 블록을 연결
    return newBlock;
  }

  /**
   * 난이도 구하기 -> 자가제한시스템
   * @param {number} difficulty 난이도
   * @returns 자가제한 시스템이 적용 된 난이도
   */
  getDifficulty(difficulty) {
    const lastBlock = this.getLastBlock();
    const SECONDS = 10; // 초
    const BLOCK_NUMBER = 10;
    const MUL = 4;
    // 10의 배수일 경우 난이도를 체크해서 변경해준다
    if (lastBlock.index > 0 && lastBlock.index % BLOCK_NUMBER === 0) {
      console.log("난이도 조절 시작");
      let prevTime = this.blocks[this.blocks.length - BLOCK_NUMBER].timestamp;
      let lastTime = lastBlock.timestamp;
      let avgTime = (lastTime - prevTime) / BLOCK_NUMBER / 1000;
      console.log("평균시간", avgTime);
      let multiple = avgTime < SECONDS ? MUL : 1 / MUL;
      console.log(avgTime < SECONDS ? "난이도를 올림" : "난이도를 낮춤");
      difficulty = multiple * difficulty;
      console.log("변경된 난이도", difficulty);
      console.log("난이도 조절 끝");
    }
    return difficulty;
  }

  /**
   * 타겟(목표값) 구하기
   * @param {number} difficulty 난이도
   * @returns 목표값
   */
  getTarget(difficulty) {
    let bits = this.difficultToBits(difficulty);
    let bits16 = parseInt("0x" + bits.toString(16), 16);
    let exponents = bits16 >> 24;
    let mantissa = bits16 & 0xffffff;
    let target = mantissa * 2 ** (8 * (exponents - 3));
    let target16 = target.toString(16);
    let k = Buffer.from("0".repeat(64 - target16.length) + target16, "hex");
    return k.toString("hex");
  }

  /**
   * 난이도를 통해서 비트 구하기
   * @param {number} difficulty 난이도
   * @returns 난이도 비트
   */
  difficultToBits(difficulty) {
    const maximumTarget = "0x00ffff000000" + "0".repeat(64 - 12);
    const difficulty16 = difficulty.toString(16);
    let target = parseInt(maximumTarget, 16) / parseInt(difficulty16, 16);
    let num = new BN(target.toString(16), "hex");
    let compact, nSize, bits;
    nSize = num.byteLength();
    if (nSize <= 3) {
      compact = num.toNumber();
      compact <<= 8 * (3 - nSize);
    } else {
      compact = num.ushrn(8 * (nSize - 3)).toNumber();
    }
    if (compact & 0x800000) {
      compact >>= 8;
      nSize++;
    }
    bits = (nSize << 24) | compact;
    if (num.isNeg()) {
      bits |= 0x800000;
    }
    bits >>>= 0;
    return parseInt(bits.toString(10));
  }

  /**
   * 체인에 연결된 마지막 블록
   * @returns 마지막 블록
   */
  getLastBlock() {
    return this.blocks[this.blocks.length - 1];
  }
  /**
   * 유효 블록 검증
   * @param {Block} preBlock
   * @param {Block} newBlock
   * @returns 유효한 블록 검증
   */
  isValidBlock(preBlock, newBlock) {
    // 제네시스 블록은 통과
    if (preBlock.index === 1) return true;
    return (
      // 제네시스 블록이 아니어야함
      preBlock.index > 1 &&
      // 새로운 블록의 이전해시와 이전블록의 해시가 같아야 함
      preBlock.hash === newBlock.previousHash &&
      // 새로운 블록의 해시와 해시함수를 통해 해시가 같아야 함
      Block.createBlockHash(newBlock) === newBlock.hash
    );
  }
  /**
   * 블록체인 유효성 검증
   * @param {Block[]} blocks
   * @returns 유효하게 검증된 블록체인
   */
  isValidBlockchain(blocks) {
    // 블록체인의 모든 블록에 접근
    for (let i = 1; i < blocks.length; i++) {
      // 앞에 블록
      let preBlock = blocks[i - 1];
      // 그 다음 블록
      let curBlock = blocks[i];
      // 두 블록을 검증 진행
      if (!this.isValidBlock(preBlock, curBlock)) {
        return false;
      }
    }
    return true;
  }

  handlChainReponse(receivedChain, ws) {
    const isValidChain = this.isValidBlockchain(receivedChain);
    if (!isValidChain) return false;

    const isValid = this.replaceChain(receivedChain);
    if (!isValid) return false;

    const msg = {
      type: MessageType.receivedChain,
      payload: receivedChain,
    };

    ws.broadcast(msg);

    return true;
  }

  // longest 체인 룰
  replaceChain(receivedChain) {
    const latestReceivedBlock = receivedChain[receivedChain.length - 1];
    const lastBlock = this.getLastBlock();

    if (latestReceivedBlock.index === 1) {
      console.log("받은 최신 블록이 제네시스 블록입니다");
      return false;
    }

    if (latestReceivedBlock.index <= lastBlock.index) {
      console.log("자신의 블록이 더 길거나 같습니다");
      return false;
    }

    this.blocks = receivedChain;

    return true;
  }
}

module.exports = Chain;
