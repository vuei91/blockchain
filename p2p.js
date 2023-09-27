const { WebSocketServer, WebSocket } = require("ws");
const MessageType = require("./msg");

class P2PServer {
  constructor() {
    this.sockets = [];
  }

  listen() {
    const server = new WebSocketServer({ port: 7545 });
    console.log("Listening...");
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
    const cb = (message) => {
      console.log(message.toString());
    };
    socket.on("message", cb);
  }

  send(socket, message) {
    socket.send(JSON.stringify(message));
  }

  broadcast(data) {
    this.sockets.forEach((socket) => socket.send(JSON.stringify(data)));
  }
}

module.exports = P2PServer;
