const Chain = require("./chain");

function main() {
  const chain = new Chain();
  let i = 0;
  while (i < 100) {
    chain.mining();
    i++;
  }
}

main();
