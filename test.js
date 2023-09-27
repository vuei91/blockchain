const Chain = require("./chain");
const P2PServer = require("./p2p");

function main() {
  const chain = new Chain();
  const p2p = new P2PServer(chain);
  p2p.listen();
  p2p.connectToPeer("ws://localhost:7545");
}

main();
