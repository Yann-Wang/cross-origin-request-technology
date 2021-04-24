var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.sendFile(path.join(__dirname, '/../static/prefetch_demo.js'));
});

module.exports = router;
