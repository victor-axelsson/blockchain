var fs = require("fs"); 
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json({limit: '50mb'}));

var CronJob = require('cron').CronJob;
var async = require("async"); 

var behaviours = require("../behaviour/behaviours"); 
var broadcast = require("./broadcast"); 

if(process.argv.length < 3){
	console.log("You need to specify a configuration");
	return;
}

//Read in the config file
var config = JSON.parse(
	fs.readFileSync(__dirname + "/configurations/" + process.argv[2] + ".json", "utf-8")); 

//Pass the configuration to the behaviour module
behaviours.setConfig(config); 

//Read in the behaviour tasks
var behaviourTasks = {};
config.behaviours.forEach((behaviour, i) => {

	//If you screw up with the behaviour name
	if(!behaviours[behaviour.tag]){
		throw "No such behaviour is implemented: " + behaviour.tag; 
	}

	//Add behaviour to the task object
	behaviourTasks[behaviour.tag + "["+ i + "]"] = behaviours[behaviour.tag]; 
}); 

//When all behviours are done running
var onNodeBehaviourAllDone = (err, res) => {
	console.log("==== <" + config.id + "> ===="); 
	if(!!err){
		console.log(err); 
	}
	console.log(res); 
	console.log("==== <" + config.id + " />===="); 
}


//Receive a blockChain
app.post('/blockchain', function (req, res) {

	console.log("[" + config.id + "] received block chain from [" + req.body.sender + "]"); 

	behaviours.mergeChain(req.body.message, (err, response) => {

		console.log("=== < Balance > ===")
		console.log(behaviours.calculateBalances()); 
		console.log("=== < Balance /> ===")
		
		if(err){
			console.log(err); 
			res.status(400).send(err);
		}else{
			console.log(response); 
			res.status(200).send("All was ok"); 
		}
	});

});

//Start up a server
var server = app.listen(config.port, function () {
   var host = server.address().address
   var port = server.address().port   
   console.log("Node: [" + config.id + "] listening at http://%s:%s", host, port)
})


//Send our block chain ever 5 sek
new CronJob('*/5 * * * * *', function() {

	//Do a best effort broadcast
    broadcast.bestEffortBroadcast(behaviours.getBlockChain(), config.id); 

}).start(); 

//Start up the behviours
async.series(behaviourTasks, onNodeBehaviourAllDone); 



