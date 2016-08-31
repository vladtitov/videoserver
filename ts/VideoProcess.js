///<reference path="../typings/q/Q.d.ts"/>
"use strict";
var Q = require('q');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(path.resolve(ROOT + "/libs/ffmpeg_win32/bin/ffmpeg.exe"));
ffmpeg.setFfprobePath(path.resolve(ROOT + "/libs/ffmpeg_win32/bin/ffprobe.exe"));
//console.log(fs.existsSync(ROOT+"/libs/ffmpeg_win32/bin/ffprobe.exe"));
var VideoProcess = (function () {
    function VideoProcess(folder) {
        this.folder = folder;
    }
    VideoProcess.prototype.makeThumbnails = function (asset) {
        var deferred = Q.defer();
        var filename = asset.filename;
        var src = path.resolve(asset.workingFolder + '/' + asset.filename);
        var currentFolder = this.folder + 'userVideos/';
        // var destPath = cientFolder + filename;
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
            // console.log('screenshots are ' + thumbs.join(', '));
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
            // count: 1,
            timemarks: ['10%', '30%', '50%'],
            size: w + 'x' + h
        }, asset.workingFolder);
        return deferred.promise;
    };
    VideoProcess.prototype.convertVideoByPath = function (path_tofile) {
        var src = path.resolve(path_tofile);
        // console.log(src);
        // console.log( fs.existsSync(src));
        ffmpeg(src)
            .on('end', function () {
            console.log('end convert');
            // asset.path = destPath;
        })
            .on('error', function (err) {
            console.error(err);
        })
            .videoCodec('libx264')
            .format('mp4')
            .save(src + '.mp4');
    };
    VideoProcess.prototype.convertVideo = function (asset) {
        var def = Q.defer();
        var filename = asset.filename;
        var src = path.resolve(asset.workingFolder + '/' + asset.filename);
        // var cientFolder = this.folder + 'userVideos/';
        var newName = asset.filename.substr(0, asset.filename.lastIndexOf('.')) + '.mp4';
        var destPath = path.resolve(asset.workingFolder + '/' + newName);
        //  var cientFolder = this.folder + 'userVideos/';
        ffmpeg(src)
            .on('end', function () {
            console.log('end convert');
            // asset.path = destPath;
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
        console.log('tempDir+filename = ', src);
        this.metadata = ffmpeg.ffprobe(src, function (err, mdata) {
            if (err) {
                return deferred.reject(err);
            }
            // console.log('metadata ', mdata);
            var stream = mdata.streams[0];
            asset.width = stream.width;
            asset.height = stream.height;
            asset.duration = Math.round(stream.duration);
            deferred.reject(asset);
            // asset.metadata = JSON.stringify(mdata);
            // deferred.resolve(asset);
        });
        return deferred.promise;
    };
    VideoProcess.prototype.processVideo = function (asset) {
        var _this = this;
        var deferred = Q.defer();
        deferred.reject('test');
        return deferred.promise;
        this.getMetadata(asset).then(function (asset) {
            // console.log('metadata ', vp.metadata);
            _this.convertVideo(asset).then(function (asset) {
                _this.makeThumbnails(asset).then(function (asset) {
                    deferred.resolve(asset);
                    // console.log('vp.makeThumbnail done ', asset);
                    /*  this.insertInDB(asset).then(function (result:UpdateResult) {
                          deferred.resolve(result);
                      }, (err)=> {deferred.reject(err)});
  */
                }, function (err) { deferred.reject(err); });
            }, function (err) { deferred.reject(err); });
        }, function (err) { deferred.reject(err); });
        // console.log('processVideo');
        return deferred.promise;
    };
    ;
    return VideoProcess;
}());
exports.VideoProcess = VideoProcess;
//# sourceMappingURL=VideoProcess.js.map