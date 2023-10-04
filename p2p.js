const { WebSocketServer, WebSocket } = require("ws");
const MessageType = require("./msg");

class P2PServer {
  constructor(chain) {
    this.chain = chain;
    this.sockets = [];
  }

  listen(port) {
    const server = new WebSocketServer({ port });
    console.log(`Listening... port is ${port}`);
    server.on("connection", (socket, req) => {
      const address = req.socket.remoteAddress;
      const port = req.socket.remotePort;
      console.log(`Success connection!! ${address}:${port}`);
      this.connectSocket(socket);
    });
  }

  connectToPeer(newPeer) {
    const socket = new WebSocket(newPeer);
    socket.on("open", () => {
      console.log("open");
      this.connectSocket(socket);
    });
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    this.messageHandler(socket);
    const data = {
      type: MessageType.latest_block,
      payload: {},
    };
    this.send(socket, data);
  }

  getSockets() {
    return this.sockets;
  }

  messageHandler(socket) {
    const callback = (message) => {
      const result = JSON.parse(message.toString());
      switch (result.type) {
        case MessageType.latest_block:
          const msg1 = {
            type: MessageType.all_block,
            payload: this.chain.getLastBlock(),
          };
          this.send(socket, msg1);
          break;
        case MessageType.all_block:
          const msg2 = {
            type: MessageType.receivedChain,
            payload: this.chain.blocks,
          };
          const receivedBlock = result.payload;
          const isSuccess = this.chain.addBlock(receivedBlock);
          if (isSuccess) break;
          this.send(socket, msg2);
          break;
        case MessageType.receivedChain:
          const receivedChain = result.payload;
          this.chain.handlChainReponse(receivedChain, this);
          break;
        case MessageType.receivedTx:
          break;
      }
    };
    socket.on("message", callback);
  }

  send(socket, message) {
    socket.send(JSON.stringify(message));
  }

  broadcast(data) {
    this.sockets.forEach((socket) => socket.send(JSON.stringify(data)));
  }
}

module.exports = P2PServer;
