var sha256 = require("sha256"); 

var block = {}; 

/**
* Get a reandom number in the given intervall
*/
var getRandNumber = (min, max) => {
	return Math.floor(Math.random() * max) + min
}

/**
* Create a new block that is not mined yet
*/
block.create = (blockNr, prev, data) => {
	return {
		blockNr: blockNr,
		previous: prev,
		nonce: 0, 
		data: data,
		hash: null
	}
}

/**
* Verify the chain
*/
block.verifyChain = (chain) => {

	for(var i = 1; i < chain.length; i++){
		var prev = chain[i -1]; 
		var curr = chain[i]; 

		//ReHash the previous block
		var prevStr = prev.blockNr + prev.nonce + prev.previous + JSON.stringify(prev.data); 
		var prevHash = sha256(prevStr);

		//Maybe we are not using the same hash algorithm
		if(prevHash !== prev.hash){
			return false; 
		}
		
		//The chain was not valid, maybe someone tried to insert something here
		if(prevHash !== curr.previous){
			return false;
		}
	}

	//It was valid
	return true;
}

/**
* Create a new block that is not mined yet
* Defaulting to 0000 as prefix
*/
block.mine = (_block, prefix = "0000") => {

	var strVal = ""; 
	//Find the hash
	while(!_block.hash || _block.hash.substr(0, prefix.length) != prefix){
		_block.nonce = getRandNumber(0, 4294967296); 
		strVal = _block.blockNr + _block.nonce + _block.previous + JSON.stringify(_block.data); 

		_block.hash = sha256(strVal); 
	}

	//console.log(strVal)

	return _block; 
}



module.exports = block;