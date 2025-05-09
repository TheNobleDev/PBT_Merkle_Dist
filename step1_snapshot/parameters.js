"use strict";

const path = require("path");
const abi = require("./abi");

const parameters = {
  abi: abi.getABI(),
  configFileName: path.join(process.cwd(), "snapshot.config.json"),
  configQuestions: [
    {
      type: "input",
      name: "provider",
      message: "Enter the URL of web3 provider",
      default: "http://localhost:8545"
    },
    {
      type: "input",
      name: "contractAddress",
      message: "Enter your contract address"
    },
    {
      type: "input",
      name: "tokenType",
      message: "Enter the token type (ERC20/ERC1155)"
    },
    {
      type: "input",
      name: "fromBlock",
      message: "Enter the block number to start from",
      default: 0
    },
    {
      type: "input",
      name: "toBlock",
      message: "Enter the block number to end at",
      default: "latest"
    },
    {
      type: "input",
      name: "blocksPerBatch",
      message: "Blocks per batch",
      default: 2500
    },
    {
      type: "input",
      name: "delay",
      message: "Delay per iteration (ms)",
      default: 0
    },
    {
      type: "input",
      name: "format",
      message: "Format -> both",
      default: "both"
    },
    {
      type: "input",
      name: "checkIfContract",
      message: "Check addresses if they are contracts or wallets?",
      default: "yes"
    }
  ],
  knownTypes: path.join(process.cwd(), "/.cache/known-types.json"),
  outputFileNameCSV: path.join(process.cwd(), "./result/{token}.csv"),
  outputFileNameJSON: path.join(process.cwd(), "./result/{token}.json"),
  
  outputCombinedCSV: path.join(process.cwd(), "./result/result_combined.csv"),
  outputCombinedJSON: path.join(process.cwd(), "./result/result_combined.json"),

  eventsDownloadFolder: path.join(process.cwd(), "./tx/{token}/"),
  eventsDownloadFilePath: path.join(process.cwd(), "./tx/{token}/{blockNumber}.json")
};

module.exports.get = () => {
  return parameters;
};
