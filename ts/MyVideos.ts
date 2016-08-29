/**
 * Created by Vlad on 8/25/2016.
 */
///<reference path="../server.ts"/>

import {VOAsset} from "./models";

import * as path from 'path'
import * as http from 'http';
import * as fs from 'fs';
import * as request from 'request';

import {FileDownloader} from "./FileDownloader";
import {VideoProcess} from "./VideoProcess";
import {Cleaner} from "./Cleaner";

declare var WWW:string;

export class   MyVideos extends Cleaner{
    server:string = 'http://192.168.1.10:56777/';
    isInprocess:boolean;
    constructor(){
       super();
    }

    registerReady(asset:VOAsset):void{
        asset.status='processed';
        this.sendReady(asset)
        var jsonfile:string = 'asset_'+asset.id+'.json';

        fs.writeFile(path.resolve(WWW+'/ready/'+jsonfile),JSON.stringify(asset), (err)=> {
            if(err) return this.onError(err,asset)
        });

    }
    downloadAsset(asset:VOAsset):void{

        var dwd:FileDownloader = new FileDownloader(asset,this.server);
        dwd.onComplete = (err)=>{
            if(err) return this.onError(err,asset);
            var processor:VideoProcess = new VideoProcess(null);
            processor.processVideo(asset).done(
                asset=>this.registerReady(asset)
                ,err=>this.onError(err,asset)
            )
        }
        dwd.getFile();
    }

    onError(err:any,asset:VOAsset):void {
        console.error(err, asset);
        console.error(err, asset);
    }

    startProcess(asset:VOAsset){
        fs.writeFile(path.resolve(asset.workingFolder+'/asset.json'),JSON.stringify(asset), (err)=> {
            if(err) return  this.onError(err,asset);
            this.downloadAsset(asset);
        });
    }


    onIdle():void{
        setTimeout(()=>this.getNewVideo(),6000);
    }


    videoStatus:string ='newvideo';
    getNewVideo(){

        if(this.isInprocess) return;
        this.isInprocess = true;

//console.log(this.server+'videoserver/get-new-file');
        var url:string = this.server+'videoserver/get-new-file/'+this.videoStatus;
        request.get(url,{json:true},(error, response:http.IncomingMessage, body)=>{
            console.log(body);
            if(error){
                this.onError(error,null);
                return
            }


            if(body.data){
                var asset:VOAsset = new VOAsset(body.data);
                if(!asset.id) {
                    return;
                }


                asset.workingFolder= path.resolve(WWW+'/'+asset.folder);


                if(fs.existsSync(asset.workingFolder)){
                    this.startProcess(asset);
                }else{
                    fs.mkdir(asset.workingFolder,(err)=>{
                        if(err)return this.onError(err,asset)
                        this.startProcess(asset);

                    });
                }
            } else this.onError(body,null);


            // console.log(body)


        });

    }
}
