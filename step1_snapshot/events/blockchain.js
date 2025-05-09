"use strict";

const Web3 = require("web3");

const BlockByBlock = require("./block-by-block");
const BlockReader = require("./block-reader");
const Config = require("../config").getConfig();
const Contract = require("../contract").getContract();
const FileHelper = require("../file-helper");
const LastDownloadedBlock = require("./last-downloaded-block");
const Parameters = require("../parameters").get();

const { promisify } = require("util");

const sleep = promisify(setTimeout);

const web3 = new Web3(new Web3.providers.HttpProvider((Config || {}).provider || "http://localhost:8545"));

const groupBy = (objectArray, property) => {
  return objectArray.reduce((acc, obj) => {
    var key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
};

const tryGetEvents = async (start, end, symbol) => {
  try {
    let pastEvents;
    if(Config.tokenType == "ERC20") {
      pastEvents = await Contract.getPastEvents("Transfer", { fromBlock: start, toBlock: end });
    } else if(Config.tokenType == "ERC1155") {
      let pastEvents1 = await Contract.getPastEvents("TransferSingle", { fromBlock: start, toBlock: end });
      let pastEvents2 = await Contract.getPastEvents("TransferBatch", { fromBlock: start, toBlock: end });
      pastEvents = pastEvents1.concat(pastEvents2);
    }

    if (pastEvents.length) {
      console.info("Successfully imported ", pastEvents.length, " events");
    }

    const group = groupBy(pastEvents, "blockNumber");

    for (let key in group) {
      if (group.hasOwnProperty(key)) {
        const blockNumber = key;
        const data = group[key];

        const file = Parameters.eventsDownloadFilePath.replace(/{token}/g, symbol).replace(/{blockNumber}/g, blockNumber);

        FileHelper.writeFile(file, data);
      }
    }
  } catch (e) {
    console.log(e)
    console.log("Could not get events due to an error. Now checking block by block.");
    await BlockByBlock.tryBlockByBlock(Contract, start, end, symbol);
  }
};

module.exports.get = async () => {
  let name;
  let symbol;
  let decimals;

  if(Config.tokenType == "ERC20") {
    try {
      name = await Contract.methods.name().call();
      symbol = await Contract.methods.symbol().call();
      decimals = await Contract.methods.decimals().call();
    } catch (errr) {
      name = Contract.address;
      symbol = Contract.address;
      decimals = 0;
    }

  } else if(Config.tokenType == "ERC1155") {
    name = Contract.address;
    symbol = Contract.address;
    decimals = 0;
  }

  const blockHeight = await web3.eth.getBlockNumber();
  var fromBlock = parseInt(Config.fromBlock) || 0;
  const blocksPerBatch = parseInt(Config.blocksPerBatch) || 0;
  const delay = parseInt(Config.delay) || 0;
  const toBlock = parseInt(Config.toBlock) || blockHeight;

  const lastDownloadedBlock = await LastDownloadedBlock.get(symbol);

  if (lastDownloadedBlock && fromBlock < lastDownloadedBlock) {
    console.log("Resuming from the last downloaded block #", lastDownloadedBlock);
    fromBlock = lastDownloadedBlock + 1;
  }

  console.log("From %d to %d", fromBlock, toBlock);

  let start = fromBlock;
  let end = fromBlock + blocksPerBatch;
  let i = 0;

  while (end <= toBlock) {
    if (delay) {
      await sleep(delay);
    }

    console.log("Batch", ++i, " From", start, "to", end);

    await tryGetEvents(start, end, symbol);

    start = end + 1;
    end = start + blocksPerBatch;

    if (end > toBlock) {
      end = toBlock;
    }
    if(start > toBlock) {
      break;
    }
  }

  const events = await BlockReader.getEvents(symbol);

  const data = {
    name,
    symbol,
    decimals,
    events: events
  };

  return data;
};
