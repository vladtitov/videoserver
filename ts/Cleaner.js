"use strict";
var models_1 = require("../../client/app/services/models");
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
        var jsonfile = 'asset_' + asset.id + '.json';
        var pattern = asset.filename.substr(0, 10);
        fs.unlink(WWW + '/ready/' + jsonfile, function (err) {
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
        });
    };
    Cleaner.prototype.onIdle = function () {
    };
    Cleaner.prototype.sendReady = function (asset) {
        var _this = this;
        asset.status = 'processed';
        var url = this.server + 'videoserver/ready';
        request.post(url, { json: true, body: asset }, function (err, res, body) {
            if (body.data) {
                var asset = new models_1.VOAsset(body.data);
                _this.isInprocess = false;
                if (asset.id && asset.status == 'ready')
                    _this.removeAsset(asset, function (err) {
                        if (err)
                            _this.onError(err, asset);
                        console.log('removed ' + asset.folder);
                        _this.onIdle();
                    });
            }
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
//# sourceMappingURL=Cleaner.js.map