var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	
	if(req.hostname == "localhost"){
		res.set('Access-Control-Allow-Origin',"http://localhost:3000");
		console.log("CORS");
  		res.send({cnt: "success"});	
	}
	
});

module.exports = router;