"use strict";
var Q = require('q');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(path.resolve(ROOT + "/libs/ffmpeg/bin/ffmpeg.exe"));
ffmpeg.setFfprobePath(path.resolve(ROOT + "/libs/ffmpeg/bin/ffprobe.exe"));
var VideoProcess = (function () {
    function VideoProcess(folder) {
        this.folder = folder;
    }
    VideoProcess.prototype.makeThumbnails = function (asset) {
        var deferred = Q.defer();
        var filename = asset.filename;
        var src = path.resolve(asset.workingFolder + '/' + asset.filename);
        var currentFolder = this.folder + 'userVideos/';
        var thumbs;
        var w = 256;
        var k = w / asset.width;
        var h = Math.round(asset.height * k);
        if (asset.height > asset.width) {
            h = 256;
            k = h / asset.height;
            w = Math.round(asset.width * k);
        }
        var proc = ffmpeg(src)
            .on('filenames', function (filenames) {
            thumbs = filenames.map(function (val) {
                return val;
            });
            asset.thumb = thumbs.join(', ');
        })
            .on('end', function () {
            deferred.resolve(asset);
            console.log('screenshots   saved');
        })
            .on('error', function (err) {
            deferred.reject(err);
        })
            .takeScreenshots({
            filename: filename + '.png',
            timemarks: ['10%', '30%', '50%'],
            size: w + 'x' + h
        }, asset.workingFolder);
        return deferred.promise;
    };
    VideoProcess.prototype.convertVideo = function (asset) {
        var def = Q.defer();
        var filename = asset.filename;
        var src = path.resolve(asset.workingFolder + '/' + asset.filename);
        var newName = asset.filename.substr(0, asset.filename.lastIndexOf('.')) + '.mp4';
        var destPath = path.resolve(asset.workingFolder + '/' + newName);
        ffmpeg(src)
            .on('end', function () {
            console.log('end convert');
            asset.filename = newName;
            def.resolve(asset);
        })
            .on('error', function (err) {
            def.reject(err);
        })
            .videoCodec('libx264')
            .format('mp4')
            .save(destPath);
        return def.promise;
    };
    VideoProcess.prototype.getMetadata = function (asset) {
        var deferred = Q.defer();
        var src = path.resolve(asset.workingFolder + '/' + asset.filename);
        this.metadata = ffmpeg.ffprobe(src, function (err, mdata) {
            if (err) {
                deferred.reject(err);
                return;
            }
            var stream = mdata.streams[0];
            asset.width = stream.width;
            asset.height = stream.height;
            asset.duration = Math.round(stream.duration);
            deferred.resolve(asset);
        });
        return deferred.promise;
    };
    VideoProcess.prototype.processVideo = function (asset) {
        var _this = this;
        var deferred = Q.defer();
        this.getMetadata(asset).then(function (asset) {
            _this.convertVideo(asset).then(function (asset) {
                _this.makeThumbnails(asset).then(function (asset) {
                    deferred.resolve(asset);
                }, function (err) { deferred.reject(err); });
            }, function (err) { deferred.reject(err); });
        }, function (err) { deferred.reject(err); });
        return deferred.promise;
    };
    ;
    return VideoProcess;
}());
exports.VideoProcess = VideoProcess;
