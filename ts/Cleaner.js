"use strict";
var models_1 = require("./models");
var path = require('path');
var fs = require('fs');
var request = require('request');
var Cleaner = (function () {
    function Cleaner() {
    }
    Cleaner.prototype.onError = function (err, asset) {
    };
    Cleaner.prototype.removeAsset = function (asset, callBack) {
        var folder = path.resolve(WWW + '/' + asset.folder);
        var pattern = asset.filename.substr(0, 10);
        fs.readdir(folder, function (err, files) {
            if (err)
                callBack(err);
            else {
                files.forEach(function (file) {
                    if (file.substr(0, 10) === pattern)
                        fs.unlink(folder + '/' + file);
                });
                callBack();
            }
        });
    };
    Cleaner.prototype.onIdle = function () {
    };
    Cleaner.prototype.removeProcessById = function (id) { };
    Cleaner.prototype.sendProcessed = function (asset) {
        var _this = this;
        console.log('sendProcessed');
        asset.status = 'processed';
        var url = this.server + 'videos/processed';
        console.log(url);
        var asset1 = new models_1.VOAsset(asset);
        delete asset1.workingFolder;
        delete asset1.errorCount;
        request.post(url, { json: true, body: asset1 }, function (err, res, body) {
            if (body.data) {
                var asset2 = new models_1.VOAsset(body.data);
                _this.isInprocess = false;
                if (asset2.id && asset2.status == 'ready')
                    _this.removeAsset(asset, function (err) {
                        if (err)
                            _this.onError(err, asset);
                        _this.removeProcessById(asset.id);
                        console.log('removed ' + asset.folder);
                        _this.onIdle();
                    });
            }
            else
                setTimeout(function () { return _this.sendProcessed(asset); }, 60000);
        });
    };
    Cleaner.prototype.checkStatus = function (asset) {
        var _this = this;
        var url = this.server + 'videoserver/get-status/' + asset.id;
        request.get(url, { json: true }, function (error, response, body) {
            console.log(body);
            if (error) {
                _this.onError(error, null);
                return;
            }
            if (body.data && body.data.status == 'ready') {
                _this.removeAsset(asset, function (err) {
                    if (err)
                        _this.onError(err, asset);
                });
            }
        });
    };
    return Cleaner;
}());
exports.Cleaner = Cleaner;
