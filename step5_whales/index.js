const fs = require('fs');
const BigNumber = require("bignumber.js");

BigNumber.config({ DECIMAL_PLACES: 9 })
let data = fs.readFileSync("whales.csv").toString().split('\n');

let outFileJSON = "result_combined.json"

let myJSONReal = {
	decimals : 18,
	airdrop : {}
};

for (var i = 0; i < data.length; i++) {
	let obj = data[i].trim();
	if(obj.startsWith("\"address\"") || obj == "") {
		continue;
	}

	let elements = obj.split(";")
	if(elements.length != 7 && obj != "") {
		console.log("Error in file formatting! Line: ", i);
		process.exit(1);
	}

	let address = elements[0].slice(1, -1).toLowerCase();
	let pbtAmtString = elements[elements.length-1].slice();

	pbtAmtString = BigNumber(pbtAmtString).toString(10);
	let pbtAmtNum = BigNumber(pbtAmtString).toNumber();
    myJSONReal.airdrop[address] = pbtAmtNum;
}

fs.writeFile(outFileJSON, JSON.stringify(myJSONReal), err => {
    if (err) return console.log(err);
    console.log('output JSON file successfully written!\n');
});
