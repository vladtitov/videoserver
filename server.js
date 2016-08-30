/**
 * Created by Vlad on 5/13/2016.
 */
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/body-parser/body-parser.d.ts" />
///<reference path="typings/express-session/express-session.d.ts"/>
///<reference path="typings/cookie-parser/cookie-parser.d.ts"/>
///<reference path="typings/request/request.d.ts"/>
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
app.get('newvideo/:id', function (req, Response) {
    var id = Number(req.params.id);
    if (isNaN(id)) {
        Response.json({ error: id });
        return;
    }
    manager.getNewVideo(id);
});
//console.log('watch');
app.use(express.static(WWW));
var port = process.env.PORT || 56555;
app.listen(port, function () {
    console.log('http://' + port);
});
var manager = new MyVideos_1.MyVideos();
manager.getNewVideo();
//# sourceMappingURL=server.js.map