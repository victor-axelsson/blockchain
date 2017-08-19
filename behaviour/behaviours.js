var genesisBlock = require("../block/genesisBlock"); 
var block = require("../block/block"); 

var behaviours = {}; 
var config = null; 

var blockChain = []; 
var toBeMined = []; 

/**
* Getter for the block chain
*/
behaviours.getBlockChain = () => {
	return blockChain; 
}

/**
* Grabs a behviour by tag from the config
*/
var grabBehaviour = (tag) => {
	for(var i = 0; i < config.behaviours.length; i++){
		if(config.behaviours[i].tag === tag){
			return config.behaviours[i]; 
		}
	}

	throw "Could not find behaviour"; 
}

var getNextBlockNr = () => {
	return blockChain.length + toBeMined.length; 
}

var getPrevHash = () => {

	//If we have no un-mined stuff, we use the blockchain
	if(toBeMined.length == 0){
		return blockChain[blockChain.length -1].hash
	}

	//Else base the hash on the chain that is not yet mined
	return toBeMined[toBeMined.length -1].hash
}

/**
* Calcualte all the accounts and their debits/credits
*/
behaviours.calculateBalances = () => {
	var accounts = {}; 

	blockChain.forEach((_block) => {

		_block.data.forEach((transaction) => {

			//Create the accounts if they don't exits
			if(!(transaction.credit in accounts)){
				accounts[transaction.credit] = 0; 
			}
			if(!(transaction.debit in accounts)){
				accounts[transaction.debit] = 0; 
			}

			//Sum the transactions
			accounts[transaction.debit] += transaction.amount; 
			accounts[transaction.credit] -= transaction.amount; 
		}); 
	})

	return accounts; 
}

/**
* Try and mege a received block chain
*/
behaviours.mergeChain = (receivedChain, callback) => {

	var valid = block.verifyChain(receivedChain); 

	if(!valid){
		callback("You have a bogus block chain. I'm gonna send you mine", blockChain); 
		return; 
	}

	if(receivedChain.length > blockChain.length){
		//Swap to the longer one
		blockChain = receivedChain; 
		callback(null, "OK, you win. I merged your chain"); 
		return; 

	}else if(receivedChain.length == blockChain.length){
		if(receivedChain[receivedChain.length -1].hash === blockChain[blockChain.length -1].hash){
			callback(null, "We have the exact same block chain");
			return;  
		}else{
			callback(null, "You have a block chain that is equal in length and valid nut not the same. I'm gonna keep mine"); 
			return; 
		}
	}else{
		callback(null, "My block chain is longer. You will have to wait for mine to be broadcasted"); 
	}
}


/**
* Set the config object to a local variable
*/
behaviours.setConfig = (_config) => {
	config = _config; 
}

/**
* Receive the genesis block
*/
behaviours.receiveGenesisBlock = (onDone) => {
	var genesis = genesisBlock.getGenesisBlock(); 
	blockChain.push(genesis);
	onDone(null, genesis); 
}
	
/**
* Creates a buy transaction
*/
behaviours.buy1 = (onDone) => {
	var behaviour = grabBehaviour("buy1"); 

	var transactionBlock = block.create(
		getNextBlockNr(), 
		getPrevHash(),
		behaviour.params.transactions
	); 

	toBeMined.push(transactionBlock); 

	onDone(null, transactionBlock); 
}

behaviours.mine = (onDone) => {
	var minedChain = []; 

	while(toBeMined.length > 0) {
		var prev = blockChain[blockChain.length -1]; 
		var unMined = toBeMined.shift(); 
		var mined = block.mine(unMined); 
		minedChain.push(mined);
	}; 

	blockChain = blockChain.concat(minedChain); 
	onDone(null, minedChain); 
}

/**
* Creates a buy transaction
*/
behaviours.buy2 = (onDone) => {
	var behaviour = grabBehaviour("buy2"); 

	var transactionBlock = block.create(
		getNextBlockNr(), 
		getPrevHash(),
		behaviour.params.transactions
	); 

	toBeMined.push(transactionBlock); 

	onDone(null, transactionBlock); 
}




module.exports = behaviours; 