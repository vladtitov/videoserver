///<reference path="../typings/q/Q.d.ts"/>



import Q = require('q');
import {VOAsset} from "./models";
//import {UpdateResult, DBDriver} from "../../server/db/dbDriver";
import * as fs from 'fs';
import * as path from 'path';


declare var WWW:string;
declare var ROOT:string;

var ffmpeg = require('fluent-ffmpeg');


ffmpeg.setFfmpegPath(path.resolve(ROOT + "/libs/ffmpeg_win32/bin/ffmpeg.exe"));
ffmpeg.setFfprobePath(path.resolve(ROOT+"/libs/ffmpeg_win32/bin/ffprobe.exe"));
//console.log(fs.existsSync(ROOT+"/libs/ffmpeg_win32/bin/ffprobe.exe"));


export class  VideoProcess {



    metadata: {};

    constructor(private folder:string) {

    }

    makeThumbnails(asset:VOAsset): Q.Promise<any> {
        var deferred: Q.Deferred<any> = Q.defer();

        var filename:string = asset.filename;
        var src:string = path.resolve(asset.workingFolder+'/'+asset.filename);

       var currentFolder = this.folder + 'userVideos/';
       // var destPath = cientFolder + filename;
        var thumbs: string[];
        var w = 256;
        var k=w/asset.width;
        var h:number= Math.round(asset.height*k);
        if(asset.height>asset.width){
            h=256;
            k=h/asset.height;
            w=Math.round(asset.width*k);
        }

        var proc = ffmpeg(src)
            .on('filenames', function(filenames) {
                thumbs = filenames.map(function(val) {
                    return val;
                });
                asset.thumb = thumbs.join(', ');
                // console.log('screenshots are ' + thumbs.join(', '));
            })
            .on('end', function() {
                deferred.resolve(asset);
               console.log('screenshots   saved');
            })
            .on('error', function(err) {
                deferred.reject(err);
            })
            .takeScreenshots(
                {
                    filename: filename +'.png',
                    // count: 1,
                    timemarks: ['10%','30%','50%'],
                    size: w+'x'+h
                },
                asset.workingFolder
            )

        return deferred.promise;
    }
convertVideoByPath(path_tofile:string):void{
      var src:string = path.resolve(path_tofile);
     // console.log(src);
    // console.log( fs.existsSync(src));

     
       ffmpeg(src)
            .on('end', function() {
               console.log('end convert');
               // asset.path = destPath;
               

            })
            .on('error', function(err) {
               console.error(err);
            })
           // .audioCodec('libfaac')
            .videoCodec('libx264')
            .format('mp4')

            .save(src+'.mp4');


}

    convertVideo(asset:VOAsset): Q.Promise<any>{
        var def: Q.Deferred<any> = Q.defer();
        var filename:string = asset.filename;

        var src:string = path.resolve(asset.workingFolder+'/'+asset.filename);
       // var cientFolder = this.folder + 'userVideos/';

        var newName:string = asset.filename.substr(0,asset.filename.lastIndexOf('.'))+'.mp4';

        var destPath =  path.resolve(asset.workingFolder+'/'+newName);



      //  var cientFolder = this.folder + 'userVideos/';
        ffmpeg(src)
            .on('end', function() {
               console.log('end convert');
               // asset.path = destPath;
                asset.filename = newName;
                def.resolve(asset);

            })
            .on('error', function(err) {
                def.reject(err);
            })
           // .audioCodec('libfaac')
            .videoCodec('libx264')
            .format('mp4')

            .save(destPath);

        return def.promise
}
    getMetadata(asset:VOAsset): Q.Promise<any>  {
        var deferred: Q.Deferred<any> = Q.defer();
        var src:string = path.resolve(asset.workingFolder+'/'+asset.filename);
       console.log('tempDir+filename = ', src);
        this.metadata = ffmpeg.ffprobe(src, function(err, mdata) {
            if(err) { return  deferred.reject(err); }
            // console.log('metadata ', mdata);
            var stream = mdata.streams[0];

            asset.width = stream.width;
            asset.height = stream.height;
            asset.duration = Math.round(stream.duration);
deferred.reject(asset)
            // asset.metadata = JSON.stringify(mdata);
           // deferred.resolve(asset);
        });
        return deferred.promise;
    }


   processVideo(asset:VOAsset): Q.Promise<any> {
        var deferred: Q.Deferred<any> = Q.defer();
        deferred.reject('test');
        return deferred.promise

        this.getMetadata(asset).then( (asset:VOAsset)=> {
            // console.log('metadata ', vp.metadata);
            this.convertVideo(asset).then( (asset:VOAsset)=> {
                this.makeThumbnails(asset).then( (asset:VOAsset)=> {
                    deferred.resolve(asset);
                    // console.log('vp.makeThumbnail done ', asset);
                  /*  this.insertInDB(asset).then(function (result:UpdateResult) {
                        deferred.resolve(result);
                    }, (err)=> {deferred.reject(err)});
*/
                }, (err)=> {deferred.reject(err)});
            }, (err)=> {deferred.reject(err)});
        }, (err)=> {deferred.reject(err)});
        // console.log('processVideo');
        return deferred.promise;
    };


}

