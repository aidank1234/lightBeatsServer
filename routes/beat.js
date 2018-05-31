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

var beatSchema = mongoose.Schema({
  name: String,
  beatStart: Number,
  beatLengths: [Number],
  brightness: [Number],
  songStartTime: Number,
  songRelation: Boolean,
  songRelationArtist: String,
  songRelationName: String,
  createdBy: String
});

var Beat = mongoose.model("Beat", beatSchema);

router.post('/newBeat', function(req, res) {
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err){
        res.send(406);
        //KICK TO LOGIN
    }
    else {
      var newBeat = new Beat({
        name: req.body["name"],
        beatStart: req.body["beatStart"],
        beatLengths: req.body["beatLengths"],
        brightness: req.body["brightness"],
        songStartTime: req.body["songStartTime"],
        songRelation: req.body["songRelation"],
        songRelationArtist: req.body["songRelationArtist"],
        songRelationName: req.body["songRelationName"],
        createdBy: req.body["createdBy"]
      });
      newBeat.save(function(error, point) {
        if(error) res.status(500).send(error);
        else res.status(200).send(point);
      });
    }

  });
});

router.post('/beatByName', function(req, res) {
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err){
        res.send(406);
        //KICK TO LOGIN
    }
    else {
      Beat.findOne({name: req.body["name"]}, function(error, beat) {
        if(beat != null) {
          res.json(beat);
        }
        else {
          res.sendStatus(500);
        }
      });
    }
  });
});

router.post('/validateName', function(req, res) {
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err){
        res.send(406);
        //KICK TO LOGIN
    }
    else {
        Beat.findOne({name: req.body["name"]}, function(error, beat) {
          if(beat == null) {
            res.sendStatus(200);
          }
          else {
            res.sendStatus(500);
          }
        });
    }
  });
});

router.post('/beatNameQuery', function(req, res) {
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err){
        res.send(406);
        //KICK TO LOGIN
    }
    else {
      var regexp = new RegExp("^" + req.body["name"])
      Beat.find({name: regexp}, function (error, beat) {
          if(error) {
            res.sendStatus(406);
          }
          else {
            res.json(beat);
          }
      });
    }
  });
});

router.post('/beatSongQuery', function(req, res) {
  if(!req.body) return res.send(400);
  jwt.verify(req.body["token"], "secretbeats", function(err, decoded) {
    if(err){
        res.send(406);
        //KICK TO LOGIN
    }
    else {
      Beat.find({songRelation: true, songRelationName: req.body["songRelationName"], songRelationArtist: req.body["songRelationArtist"]}, function(error, beats) {
        if(error) {
          res.sendStatus(406);
        }
        else {
          var arrayLength = beats.length;
          res.json({"results": arrayLength});
        }
      });
    }
  });
});
module.exports = router;
