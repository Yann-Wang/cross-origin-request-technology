var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log(req.query.callback);
  	res.send(req.query.callback + "({ip:'192.168.68.144',city:'hz',region_name:'zj'})");
});

module.exports = router;
