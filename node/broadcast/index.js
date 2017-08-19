var request = require("request"); 

var topologyManager = require("./topologyManager"); 

var broadcast = {}; 

broadcast.bestEffortBroadcast = (message, sender) => {
	var topology = topologyManager.getTopology(); 

	topology.forEach((node) => {

		try{
			request({
				method: 'POST',
				headers: {
					 "Content-Type": "application/json",
				},
				body: {
					sender: sender,
					message: message
				},
				url: node.ip + ":" + node.port + "/blockchain",
				json:true
			}); 
		}catch(e){	
			//We don't really care about this
		}
	})
}



module.exports = broadcast; 