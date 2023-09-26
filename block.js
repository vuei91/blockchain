const { SHA256 } = require("crypto-js");
const merkle = require("merkle");

// npm install crypto-js merkle
class Block {
  constructor(previousBlock, transactions) {
    this.index = (previousBlock?.index || 0) + 1; // 블록넘버
    this.timestamp = new Date().getTime(); // 타임스탬프
    this.previousHash = previousBlock?.hash; // 이전 블록해시
    this.nonce = 0; // 해시퍼즐정답
    this.difficulty = 0; // 해시퍼즐
    this.hash; // 현재 블록 해시값
    this.merkleRoot = Block.getMerkleRoot(transactions); // 머클루트
    this.transactions = transactions; // 트랜잭션 모음
  }

  static getMerkleRoot(data) {
    const merkleTree = merkle("sha256").sync(data);
    return merkleTree.root();
  }

  static createBlockHash(block) {
    const { index, timestamp, merkleRoot, previousHash, nonce } = block;
    const values = `${index}${timestamp}${merkleRoot}${previousHash}${nonce}`;
    return SHA256(values).toString();
  }

  static getGenesis() {
    const transactions = ["2차 구제금융"];
    const genesisBlock = new Block({ index: 0, hash: 0x0 }, transactions);
    genesisBlock.hash = Block.createBlockHash(genesisBlock);
    return genesisBlock;
  }
}

module.exports = Block;
