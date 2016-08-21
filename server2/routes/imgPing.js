var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log(req.query.name);
  	res.send("got it.");
});

module.exports = router;
