const { BN } = require("bn.js");
const Block = require("./block");

class Chain {
  constructor() {
    this.blocks = [Block.getGenesis()]; // 블록 모이는 곳
    this.mempool = []; // tx 모이는 곳
  }
  // 트랜잭션 추가
  addTx(tx) {
    this.mempool.push(tx);
  }
  addBlock(block) {
    //TODO block 유효성 검증을 진행해야함
    this.blocks.push(block);
  }
  // 채굴
  mining() {
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
    }
    // 해시퍼즐 정답을 만든 해시를 기존 블록에 셋팅
    newBlock.hash = Block.createBlockHash(newBlock);
    // 새로만든 블록 출력
    console.log(newBlock);
    console.log("채굴 성공!");
  }
  // 난이도 구하기 -> 자가제한시스템
  getDifficulty(difficulty) {
    return 1;
  }
  // 타겟(목표값) 구하기
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
  // 난이도를 통해서 비트구하기
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
  // 마지막 블록
  getLastBlock() {
    return this.blocks[this.blocks.length - 1];
  }
  // 유효성 블록 검증
  isValidBlock() {}
  // 유효성 블록체인 검증
  isValidBlockchain() {}
}

module.exports = Chain;
