var express = require('express');
var router = express.Router();
var http = require('http');
var url = require('url');
var util = require('util');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/my_db');

var userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  beats: [String]
});

var User = mongoose.model("User", userSchema);

router.post('/createUser', function(req, res){
  if(!req.body) return res.send(400);
  var newUser = new User({
    username: req.body["username"],
    email: req.body["email"],
    bcrypt.hash(req.body["password"], 10, function(err, hash) {
      password: hash
    });
  });
  newUser.save(function(err, point){
    if(err) res.status(500).send(err);
    else {
      const payload = {
        username: newUser.username,
        email: newUser.email
      };
      var token = jwt.sign(payload, "secretbeats", {
        expiresInMinutes: 120
      });
      var tokenLong = jwt.sign(payload, "secretbeatslong", {
        expiresInMinutes: 10080
      });
      res.json({
        success: true,
        message: "AUTHENTICATED",
        token: token,
        tokenLong: tokenLong
      });
    }
  });
});

router.post('/signIn', function(req, res){
    if(!req.body) return res.send(400);
    User.findOne({username: req.body["username"]}, function(error, user){
        if(user != null) {
          bcrypt.hash(req.body["password"], 10, function(err, hash) {
            if(hash == user.password) {
              const payload = {
                username: user.username,
                email: user.email
              };
              var token = jwt.sign(payload, "secretbeats", {
                expiresInMinutes: 15
              });
              var tokenLong = jwt.sign(payload, "secretbeatslong", {
                expiresInMinutes: 10080
              });
              res.json({
                success: true,
                message: "AUTHENTICATED",
                token: token,
                tokenLong: tokenLong
              });
            }
          });
        }
        else res.status(406).send({"ERROR": "NO ACCESS"});
    });
});

//Requires username, email, token, tokenlong
router.post('/checkSession', function(req, res){
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err) {
      if(err.name == "TokenExpiredError") {
        jwt.verify(req.body["tokenLong"], "secretbeatslong", fucntion(longErr, longDecoded){
          if(longErr) {
            res.send(406);
          }
          else {
            const payload = {
              username: req.body["username"],
              email: req.body["email"]
            };
            var token = jwt.sign(payload, "secretbeats", {
              expiresInMinutes: 120
            });
            var tokenLong = jwt.sign(payload, "secretbeatslong", {
              expiresInMinutes: 10080
            });
            res.json({
              token: token,
              tokenLong: tokenLong
            });
          }
        });
      }
    }
  });
});
module.exports = router;
