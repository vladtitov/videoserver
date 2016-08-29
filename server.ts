/**
 * Created by Vlad on 5/13/2016.
 */
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/body-parser/body-parser.d.ts" />
///<reference path="typings/express-session/express-session.d.ts"/>
///<reference path="typings/cookie-parser/cookie-parser.d.ts"/>
///<reference path="typings/request/request.d.ts"/>


import * as http from 'http';
import * as path from 'path';
GLOBAL.ROOT = __dirname;
GLOBAL.WWW = path.resolve( __dirname + '/www');
import * as express from 'express';





import {MyVideos} from "./ts/MyVideos";

//var path = require('path');
declare var GLOBAL:any;
declare var ROOT:string;
declare var WWW:string;




const app = express();

app.use(function(req:express.Request, res:express.Response, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.use(express.static(WWW));

const port:number = process.env.PORT || 56555;


app.listen(port,function(){
    console.log('http://' + port);
});



var manager:MyVideos = new MyVideos()
manager.getNewVideo();









