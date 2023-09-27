const Chain = require("./chain");

function main() {
  const chain = new Chain();
  let i = 0;
  while (i < 10) {
    chain.mining();
    i++;
  }
  console.log(chain.blocks);
  let result = chain.isValidBlockchain(chain.blocks);
  console.log(result);
}

main();
