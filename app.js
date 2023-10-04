const express = require("express");
const app = express();
const Chain = require("./chain");
const chain = new Chain();
// 채굴
app.get("/mining", async (req, res) => {
  res.send("채굴시작");
  while (true) {
    await chain.mining();
  }
});

// 노드를 추가
app.get("/addPeer", (req, res) => {
  res.send("노드 추가");
});

app.listen(3000, () => {
  console.log("Connected 3000port");
});
