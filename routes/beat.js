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

var beatSchema = mongoose.Schema({
  name: String,
  beatStart: Number,
  beatLengths: [Number],
  length: Number,
  songRelationName: String,
  songRelationArtist: String,
  createdAt: Number
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
        length: -1,
        songRelationName: req.body["songRelationName"],
        songRelationArtist: req.body["songRelationArtist"],
        createdAt: Date.now()
      });
      var totalLength = 0;
      for(var i=0; i<newBeat.beatLengths.length; i++) {
        totalLength = totalLength + beatLengths[i];
      }
      newBeat.length = totalLength;
      newBeat.save(function(error, point) {
        if(error) res.status(500).send(error);
        else res.status(200).send(point);
      });
    }

  });
});
