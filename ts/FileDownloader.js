"use strict";
var path = require('path');
var http = require('http');
var fs = require('fs');
var FileDownloader = (function () {
    function FileDownloader(asset, server) {
        this.asset = asset;
        this.server = server;
    }
    FileDownloader.prototype.getFile = function () {
        var _this = this;
        this.downloader(function (err) {
            if (_this.onComplete)
                _this.onComplete(err);
        });
    };
    FileDownloader.prototype.downloader = function (callBack) {
        var dest = path.resolve(this.asset.workingFolder + '/' + this.asset.filename);
        var file = fs.createWriteStream(dest);
        var url = this.server + '/' + this.asset.path;
        console.log(url);
        http.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close();
                callBack();
            }).on('error', function (err) {
                fs.unlink(dest);
                if (callBack)
                    callBack(err);
            });
        });
    };
    return FileDownloader;
}());
exports.FileDownloader = FileDownloader;
