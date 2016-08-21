var express = require('express');
var router = express.Router();

var count = 0;
var arrayData =["this","is","a","server","sent","event"];
var aDL = arrayData.length;
/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.hostname == "localhost"){
  		count++;
		res.set('Access-Control-Allow-Origin',"http://localhost:3000");
		res.set('Content-Type','text/event-stream'); 
		res.set('Cache-Control','no-cache');
		res.set('Connection','keep-alive');
		//data字段后必须有空行
		res.send("data: " + arrayData[count%aDL] + "\n\n id: " + count); 
		
	}
});

module.exports = router;
