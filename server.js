"use strict";
var path = require('path');
GLOBAL.ROOT = __dirname;
GLOBAL.WWW = path.resolve(__dirname + '/www');
var express = require('express');
var MyVideos_1 = require("./ts/MyVideos");
var app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.static(WWW));
var port = process.env.PORT || 56555;
app.listen(port, function () {
    console.log('http://' + port);
});
var manager = new MyVideos_1.MyVideos();
manager.getNewVideo();
