var express = require('express');
var router = express.Router();

var count = 0;
/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.hostname == "localhost"){
  		setTimeout(function(){
  			count++;
  			res.set('Access-Control-Allow-Origin',"http://localhost:3000");
  			console.log("long polling" + count);
  			res.send("access success: " + count);	
  		}, 5000);
		
	}
});

module.exports = router;
