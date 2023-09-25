const SHA256 = require("crypto-js/sha256");

const plainText = "Hello world";

const hash = SHA256(plainText).toString();

console.log("hash", hash);

const merkle = require("merkle");

const data = ["a", "b", "c", "d", "e", "f", "g", "h"];

const merkleTree = merkle("sha256").sync(data);

const merkleRoot = merkleTree.root();

console.log("merkleRoot", merkleRoot);
