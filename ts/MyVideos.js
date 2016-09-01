"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var models_1 = require("./models");
var path = require('path');
var fs = require('fs');
var request = require('request');
var FileDownloader_1 = require("./FileDownloader");
var VideoProcess_1 = require("./VideoProcess");
var Cleaner_1 = require("./Cleaner");
var MyVideos = (function (_super) {
    __extends(MyVideos, _super);
    function MyVideos() {
        _super.call(this);
        this.server = 'http://127.0.0.1:56777/';
        this.loadInProcess();
    }
    MyVideos.prototype.registerProcessed = function (asset) {
        asset.status = 'processed';
        this.saveInProcess();
        this.sendProcessed(asset);
    };
    MyVideos.prototype.saveInProcess = function () {
        var _this = this;
        fs.writeFile(path.resolve('inprocess.json'), JSON.stringify(this.inProcess), function (err) {
            if (err)
                return _this.onError(err, null);
        });
    };
    MyVideos.prototype.checkIsEnyProessed = function () {
        console.log('checkIsEnyProessed');
        var assetInProess = this.inProcess.filter(function (asset) {
            return asset.status == 'processed';
        });
        console.log('assetInProess: ', assetInProess[0]);
        if (assetInProess.length)
            this.sendProcessed(assetInProess[0]);
        else
            this.isInprocess = false;
    };
    MyVideos.prototype.addInProcess = function (asset) {
        this.inProcess.push(asset);
        this.saveInProcess();
        return true;
    };
    MyVideos.prototype.loadInProcess = function () {
        console.log('loadInProcess');
        if (fs.existsSync('inprocess.json'))
            this.inProcess = JSON.parse(fs.readFileSync('inprocess.json', 'utf8'));
        else
            this.inProcess = [];
    };
    MyVideos.prototype.retrieveProcess = function () {
        console.log('retrieveProcess');
        console.log('inProcess:', this.inProcess.length);
        if (this.inProcess.length) {
            if (this.inProcess[0].status == "newvideo")
                this.startProcessVideo(this.inProcess[0]);
        }
        return this.inProcess.length !== 0;
    };
    MyVideos.prototype.removeProcessById = function (id) {
        var arr = this.inProcess;
        for (var i = arr.length; i >= 0; i--) {
            if (arr[i].id === id)
                arr.slice(i, 1);
        }
        this.saveInProcess();
    };
    MyVideos.prototype.startProcessVideo = function (asset) {
        var _this = this;
        console.log('startProcessVideo');
        var processor = new VideoProcess_1.VideoProcess(null);
        processor.processVideo(asset).done(function (asset) { return _this.registerProcessed(asset); }, function (err) {
            _this.onError(err, asset);
        });
    };
    MyVideos.prototype.downloadAsset = function (asset) {
        var _this = this;
        console.log('downloadAsset');
        var dwd = new FileDownloader_1.FileDownloader(asset, this.server);
        dwd.onComplete = function (err) {
            if (err) {
                console.log('onComplete error', err);
                asset.errorCount++;
                if (asset.errorCount > 5) {
                    _this.removeProcessById(asset.id);
                    if (!_this.retrieveProcess())
                        _this.getNewVideo();
                    return;
                }
                setTimeout(function () { return _this.downloadAsset(asset); }, 60000);
                asset.status = 'errorDownload';
                _this.saveInProcess();
                return _this.onError(err, asset);
            }
            asset.errorCount = 0;
            _this.startProcessVideo(asset);
        };
        dwd.getFile();
    };
    MyVideos.prototype.onError = function (err, asset) {
        console.error('onError ' + new Date().toLocaleString());
        console.error(err, asset);
    };
    MyVideos.prototype.startProcess = function (asset) {
        asset.errorCount = 0;
        this.addInProcess(asset);
        this.downloadAsset(asset);
    };
    MyVideos.prototype.onIdle = function () {
        var _this = this;
        setTimeout(function () { return _this.getNewVideo(); }, 6000);
        this.checkIsEnyProessed();
    };
    MyVideos.prototype.converVideo = function (path) {
        var processor = new VideoProcess_1.VideoProcess(null);
        processor.convertVideoByPath(path);
    };
    MyVideos.prototype.getNewVideo = function () {
        var _this = this;
        console.log('getNewVideo');
        console.log('isInprocess:', this.isInprocess);
        if (this.isInprocess)
            return false;
        this.isInprocess = true;
        var url = this.server + 'videos/get-new-video';
        console.log('getNewVideo url:', url);
        request.get(url, { json: true }, function (error, response, body) {
            if (error) {
                console.log('getNewVideo error');
                _this.isInprocess = false;
                setTimeout(function () { return _this.getNewVideo(); }, 60000);
                _this.onError(error, null);
                return;
            }
            if (body.data) {
                console.log('getNewVideo body: ', body.data);
                var asset = new models_1.VOAsset(body.data);
                if (!asset.id) {
                    return;
                }
                asset.workingFolder = path.resolve(WWW + '/' + asset.folder);
                if (fs.existsSync(asset.workingFolder)) {
                    _this.startProcess(asset);
                }
                else {
                    fs.mkdir(asset.workingFolder, function (err) {
                        if (err)
                            return _this.onError(err, asset);
                        _this.startProcess(asset);
                    });
                }
            }
            else {
                setTimeout(function () { return _this.getNewVideo(); }, 60000);
                _this.onError(body, null);
            }
        });
        return true;
    };
    return MyVideos;
}(Cleaner_1.Cleaner));
exports.MyVideos = MyVideos;
