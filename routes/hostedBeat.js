var express = require('express');
var router = express.Router();
var http = require('http');
var url = require('url');
var util = require('util');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/my_db');

function seconds_since_epoch() {
  var d = Math.floor(Date.now() / 1000);
  return d;
}

var sessionSchema = mongoose.Schema({
  code: Number,
  subscribers: Number,
  lightBeat: String,
  hostedBy: String,
  started: Boolean,
  timeStarted: Number
});

var Session = mongoose.model("Session", sessionSchema);
var Beat = mongoose.model("Beat");

router.post('/newSession', function(req, res) {
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err){
        res.send(406);
        //KICK TO LOGIN
    }
    else {
        createNewSession(req, res);
    }
  });
});

function createNewSession(req, res) {
  var val = Math.floor(1000 + Math.random() * 9000);
  Session.findOne({code: val}, function(error, session) {
    if(session != null) {
      createNewSession(req, res);
    }
    else {
      var newSession = new Session({
        code: val,
        subscribers: 0,
        lightBeat: req.body["lightBeat"],
        hostedBy: req.body["username"],
        started: false,
        timeStarted: seconds_since_epoch()
      });
      newSession.save(function(error, point) {
        if(error) res.status(500).send(error);
        else res.status(200).json({"code": newSession.code});
      });
    }
  });
}

router.post('/joinSession', function(req, res) {
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err){
        res.send(406);
        //KICK TO LOGIN
    }
    else {
      Session.findOne({code: req.body["code"]}, function(error, session) {
        if(session != null) {
          session.subscribers = session.subscribers + 1;
          session.save();
          res.json(session);
        }
        else {
          res.status(500).send({"FAILED": true});
        }
      });
    }
  });
});

router.post('/checkLive', function(req, res) {
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err){
        res.send(406);
        //KICK TO LOGIN
    }
    else {
      Session.findOne({code: req.body["code"]}, function(error, session) {
        if(session != null) {
          if(session.started == true) {
            res.json({"started": true, "dateStarted": session.timeStarted});
          }
          else {
            res.json({"started": false});
          }
        }
        else {
          res.sendStatus(500);
        }
      });
    }
  });
});

router.post('/startSession', function(req, res) {
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err){
        res.send(406);
        //KICK TO LOGIN
    }
    else {
      Session.findOne({code: req.body["code"]}, function(error, session) {
        if(session != null) {
          session.started = true;
          session.timeStarted = seconds_since_epoch();
          Beat.findOne({name: session.lightBeat}, function(anError, beat) {
            if(error == null && beat != null) {
              beat.plays = beat.plays + 1;
              beat.save()
            }
          });
          session.save(function(sessionError, point) {
            if(sessionError) {
              res.send(500);
            }
            else {
              res.json(point);
            }
          });
        }
        else {
          res.sendStatus(500);
        }
      });
    }

  });
});

router.post('/deleteSession', function(req, res) {
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err){
        res.send(406);
        //KICK TO LOGIN
    }
    else {
      Session.findOne({code: req.body["code"]}, function(error, session) {
        if(session != null) {
          session.code = 123456789;
          session.save(function(sessionError, point) {
            if(sessionError == null) {
              res.json(point);
            }
            else {
              res.sendStatus(500);
            }
          });
        }
        else {
          res.sendStatus(500);
        }
      });
    }
  });
});
module.exports = router;
