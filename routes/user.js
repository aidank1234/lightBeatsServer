var express = require('express');
var router = express.Router();
var http = require('http');
var url = require('url');
var util = require('util');
var passwordHash = require('password-hash');
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
  var hashedPassword = passwordHash.generate(req.body["password"]);
  var newUser = new User({
    username: req.body["username"],
    email: req.body["email"],
    password: hashedPassword
  });
  newUser.save(function(err, point){
    if(err) res.status(500).send(err);
    else {
      const payload = {
        username: newUser.username,
        email: newUser.email
      };
      var token = jwt.sign(payload, "secretbeats", {
        expiresIn: "2h"
      });
      var tokenLong = jwt.sign(payload, "secretbeatslong", {
        expiresIn: "7d"
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
            if(passwordHash.verify(req.body["password"], user.password)) {
              const payload = {
                username: user.username,
                email: user.email
              };
              var token = jwt.sign(payload, "secretbeats", {
                expiresIn: "2h"
              });
              var tokenLong = jwt.sign(payload, "secretbeatslong", {
                expiresIn: "7d"
              });
              res.json({
                success: true,
                message: "AUTHENTICATED",
                token: token,
                tokenLong: tokenLong
              });
            }
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
        jwt.verify(req.body["tokenLong"], "secretbeatslong", function(longErr, longDecoded){
          if(longErr) {
            res.send(406);
          }
          else {
            const payload = {
              username: req.body["username"],
            };
            var token = jwt.sign(payload, "secretbeats", {
              expiresIn: "2h"
            });
            var tokenLong = jwt.sign(payload, "secretbeatslong", {
              expiresIn: "7d"
            });
            res.json({
              token: token,
              tokenLong: tokenLong
            });
          }
        });
      }
      else {
        res.send(406);
      }
    }
    else {
      const payload = {
        username: req.body["username"],
      };
      var token = jwt.sign(payload, "secretbeats", {
        expiresIn: "2h"
      });
      var tokenLong = jwt.sign(payload, "secretbeatslong", {
        expiresIn: "7d"
      });
      res.json({
        token: token,
        tokenLong: tokenLong
      });
    }
  });
});

router.post('/addBeat', function(req, res) {
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err) {
      res.send(406);
    }
    else {
      User.findOne({username: req.body["username"]}, function(error, user) {
        if(user != null) {
          user.beats.push(req.body["beatName"]);
          user.save(function(saveError, point) {
            if(saveError) {
              res.send(406);
            }
            else res.send(point);
          });
        }
        else {
          res.send(406);
        }
      });
    }
  });
});

router.post('/getBeats', function(req, res) {
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err) {
      res.send(406);
    }
    else {
      User.findOne({username: req.body["username"]}, function(error, user) {
        if(user != null) {
          res.json(user);
        }
        else {
          res.sendStatus(406);
        }
      });
    }
  });
});
module.exports = router;
