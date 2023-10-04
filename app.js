const express = require("express");
const app = express();
const Chain = require("./chain");
const MessageType = require("./msg");
const chain = new Chain();
const P2PServer = require("./p2p");
const ws = new P2PServer(chain);

app.get("/blocks", (req, res) => {
  res.json(chain.blocks);
});

// 채굴
app.get("/mining", async (req, res) => {
  res.send("채굴시작");
  while (true) {
    const newBlock = await chain.mining();
    chain.addBlock(newBlock);
    const msg = {
      type: MessageType.latest_block,
      payload: {},
    };
    ws.broadcast(msg);
  }
});

// 노드를 추가
app.get("/addPeer", (req, res) => {
  if (!req.query.port) {
    res.send("포트를 지정해주세요");
    return;
  }
  ws.connectToPeer(`ws://localhost:${req.query.port}`);
  res.send("노드 추가");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Connected ${PORT}port`);
  ws.listen(PORT * 1 + 4545);
});
