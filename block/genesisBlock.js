var sha256 = require("sha256"); 
var block = require("./block"); 

var genesis = {}; 

//Give node1 500 from the bank
var transaction1 = {
	"amount": 500,
	"debit": "node1",
	"credit": "bank"
}; 

//Give node2 700 from the bank
var transaction2 = {
	"amount": 700,
	"debit": "node2",
	"credit": "bank"
}; 

var genesisBlock = {
	blockNr: 0,
	nonce: 0, 
	data: [transaction1, transaction2],
	hash: null,
	previous: "" // <- it doens't have a previous block
}

genesis.getGenesisBlock = () => {
	
	var prefix = "0000"; 

	var strVal = "";

	//Find the hash
	while(!genesisBlock.hash || genesisBlock.hash.substr(0, prefix.length) != prefix){
		genesisBlock.nonce++; 

		strVal = genesisBlock.blockNr + genesisBlock.nonce + JSON.stringify(genesisBlock.data); 

		genesisBlock.hash = sha256(strVal); 
	}

	console.log(strVal);

	return genesisBlock;  
}



module.exports = genesis; 