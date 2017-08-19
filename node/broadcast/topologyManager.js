var topologyManager = {}; 


topologyManager.getTopology = () => {
	return [{
		port: 3001,
		ip: "http://localhost"
	},{
		port: 3002,
		ip: "http://localhost"
	}]; 
}



module.exports = topologyManager; 