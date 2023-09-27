const { SHA256 } = require("crypto-js");
const merkle = require("merkle");

class Block {
  /**
   * Block 인스턴스 시 초기화
   * @param {Block} previousBlock
   * @param {object[]} transactions
   */
  constructor(previousBlock, transactions) {
    this.index = (previousBlock?.index || 0) + 1; // 블록넘버
    this.timestamp = new Date().getTime(); // 타임스탬프
    this.previousHash = previousBlock?.hash; // 이전 블록해시
    this.nonce = 0; // 해시퍼즐정답
    this.difficulty = 1; // 해시퍼즐
    this.hash = 0; // 현재 블록 해시값
    this.merkleRoot = Block.getMerkleRoot(transactions); // 머클루트
    this.transactions = transactions; // 트랜잭션 모음 body
  }

  /**
   * 트랜잭션 데이터 머클루트해시
   * @param {object[]} data
   * @returns 머클루트해시
   */
  static getMerkleRoot(data) {
    const merkleTree = merkle("sha256").sync(data);
    return merkleTree.root();
  }

  /**
   * SHA256 해시 만들기 - nonce를 통해 채굴시 사용
   * @param {Block} block
   * @returns SHA256 해시
   */
  static createBlockHash(block) {
    const { index, timestamp, merkleRoot, previousHash, nonce } = block;
    const values = `${index}${timestamp}${merkleRoot}${previousHash}${nonce}`;
    return SHA256(values).toString();
  }

  /**
   * 제네시스블록 가져오기
   * @returns 제네시스블록
   */
  static getGenesis() {
    const transactions = ["2차 구제금융"];
    const genesisBlock = new Block({ index: 0, hash: 0x0 }, transactions);
    genesisBlock.hash = Block.createBlockHash(genesisBlock);
    return genesisBlock;
  }
}

module.exports = Block;
