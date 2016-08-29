"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var models_1 = require("../../client/app/services/models");
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
        this.server = 'http://192.168.1.10:56777/';
        this.videoStatus = 'newvideo';
    }
    MyVideos.prototype.registerReady = function (asset) {
        var _this = this;
        asset.status = 'processed';
        this.sendReady(asset);
        var jsonfile = 'asset_' + asset.id + '.json';
        fs.writeFile(path.resolve(WWW + '/ready/' + jsonfile), JSON.stringify(asset), function (err) {
            if (err)
                return _this.onError(err, asset);
        });
    };
    MyVideos.prototype.downloadAsset = function (asset) {
        var _this = this;
        var dwd = new FileDownloader_1.FileDownloader(asset, this.server);
        dwd.onComplete = function (err) {
            if (err)
                return _this.onError(err, asset);
            var processor = new VideoProcess_1.VideoProcess(null);
            processor.processVideo(asset).done(function (asset) { return _this.registerReady(asset); }, function (err) { return _this.onError(err, asset); });
        };
        dwd.getFile();
    };
    MyVideos.prototype.onError = function (err, asset) {
        console.error(err, asset);
        console.error(err, asset);
    };
    MyVideos.prototype.startProcess = function (asset) {
        var _this = this;
        fs.writeFile(path.resolve(asset.workingFolder + '/asset.json'), JSON.stringify(asset), function (err) {
            if (err)
                return _this.onError(err, asset);
            _this.downloadAsset(asset);
        });
    };
    MyVideos.prototype.onIdle = function () {
        var _this = this;
        setTimeout(function () { return _this.getNewVideo(); }, 6000);
    };
    MyVideos.prototype.getNewVideo = function () {
        var _this = this;
        if (this.isInprocess)
            return;
        this.isInprocess = true;
        var url = this.server + 'videoserver/get-new-file/' + this.videoStatus;
        request.get(url, { json: true }, function (error, response, body) {
            console.log(body);
            if (error) {
                _this.onError(error, null);
                return;
            }
            if (body.data) {
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
            else
                _this.onError(body, null);
        });
    };
    return MyVideos;
}(Cleaner_1.Cleaner));
exports.MyVideos = MyVideos;
//# sourceMappingURL=MyVideos.js.map