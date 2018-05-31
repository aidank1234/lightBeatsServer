var express = require('express');
var router = express.Router();
var user = require('./user.js');
var beat = require('./beat.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/user', user);
router.use('/beat', beat);

module.exports = router;
