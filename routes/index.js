var express = require('express');
var router = express.Router();
var user = require('./user.js');
var beat = require('./beat.js');
var session = require('./hostedBeat.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/user', user);
router.use('/beat', beat);
router.use('/session', session);

module.exports = router;
