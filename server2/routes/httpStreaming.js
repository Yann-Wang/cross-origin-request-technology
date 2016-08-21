var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	
	if(req.hostname == "localhost"){
		res.set('Access-Control-Allow-Origin',"http://localhost:3000");
    res.set('Content-Type','text/html');  // html格式 可以边下载边解析
  		//res.send({cnt: "success"});

  		var count = 0;
  		function resWrite(){
  			res.write("server2 data: " + count + "\n");
  			count ++;
  			if(count <5){
  				delay(5000, resWrite);		
  			}else {
  				resEnd();
  			}
  			
  		}

  		function resEnd(){
  			res.end("server2 end");
  		}

  		delay(5000, resWrite);
  		
	}
	
});


function delay(time, ResWrite){
	setTimeout(function(){
		ResWrite();
	}, time);
}

module.exports = router;