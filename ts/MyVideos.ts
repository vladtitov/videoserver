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
    // server:string = 'http://192.168.1.10:56777/';
    // server:string = 'http://192.168.0.82:56777/';
    server:string = 'http://127.0.0.1:56777/';

    isInprocess:boolean;

    constructor(){
       super();
       this.loadInProcess();
    }

    registerProcessed(asset:VOAsset):void{
        asset.status='processed';
        this.saveInProcess();
        this.sendProcessed(asset);
    }

    inProcess:VOAsset[];
    private saveInProcess():void{
        fs.writeFile(path.resolve('inprocess.json'),JSON.stringify(this.inProcess), (err)=> {
            if(err) return  this.onError(err,null);  
                
        });
    }
    checkIsEnyProessed(){
        console.log('checkIsEnyProessed');
        var assetInProess:VOAsset[] = this.inProcess.filter(function(asset) {
            return asset.status == 'processed';
        });
        console.log('assetInProess: ', assetInProess[0]);
        if(assetInProess.length) this.sendProcessed(assetInProess[0]);
        else this.isInprocess = false;
    }
    private addInProcess(asset:VOAsset):boolean{
        this.inProcess.push(asset);
        this.saveInProcess();
        return true;
    }
    private loadInProcess():void{
        console.log('loadInProcess');
        if(fs.existsSync('inprocess.json')) this.inProcess =JSON.parse(fs.readFileSync('inprocess.json','utf8'));
        else this.inProcess=[];
    }
    retrieveProcess():boolean{
        console.log('retrieveProcess');
        console.log('inProcess:', this.inProcess.length);
        // newvideo -> обработать
        //
        if(this.inProcess.length) {

            if(this.inProcess[0].status == "newvideo") this.startProcessVideo(this.inProcess[0]);

            // switch (this.inProcess[0].status) {
            //     case "newvideo":
            //         this.startProcessVideo(this.inProcess[0]);
            //         break;
            //     case 5:
            //         alert( 'Перебор' );
            //         break;
            //     default:
            //         alert( 'Я таких значений не знаю' );
            // }

        } //this.downloadAsset(this.inProcess[0]);

        return this.inProcess.length !== 0;
    }
    removeProcessById(id:number){
        var arr:VOAsset[] = this.inProcess;
        for(var i=arr.length; i>=0; i--){
            if(arr[i].id === id) arr.slice(i,1);
        }
        this.saveInProcess();
    }
    startProcessVideo(asset:VOAsset){
        console.log('startProcessVideo');
        var processor:VideoProcess = new VideoProcess(null);

        processor.processVideo(asset).done(
            asset=>this.registerProcessed(asset)
            ,err=>{
                this.onError(err,asset)
            }
        )
    }

    downloadAsset(asset:VOAsset):void{
        console.log('downloadAsset');
        var dwd:FileDownloader = new FileDownloader(asset,this.server);
        dwd.onComplete = (err)=>{
            if(err) {
                console.log('onComplete error', err);
                asset.errorCount++;
                if(asset.errorCount > 5) {
                    this.removeProcessById(asset.id);
                    if(!this.retrieveProcess()) this.getNewVideo();
                    return;
                }
                setTimeout(()=> this.downloadAsset(asset),60000);
                asset.status = 'errorDownload';

                this.saveInProcess();
                return this.onError(err,asset);
            }
            asset.errorCount = 0;
            this.startProcessVideo(asset);
        }
        dwd.getFile();
    }

    onError(err:any,asset:VOAsset):void {

        console.error('onError '+ new Date().toLocaleString());
        console.error(err, asset);
    }

    startProcess(asset:VOAsset){
        asset.errorCount = 0;
        this.addInProcess(asset);
        this.downloadAsset(asset);
    }


    onIdle():void{
        setTimeout(()=>this.getNewVideo(),6000);
        this.checkIsEnyProessed();
    }

    converVideo(path:string):void{
          var processor:VideoProcess = new VideoProcess(null);
          processor.convertVideoByPath(path);
    }


    getNewVideo():boolean{
        console.log('getNewVideo');
        console.log('isInprocess:', this.isInprocess);
        if(this.isInprocess) return false;
        this.isInprocess = true;

//console.log(this.server+'videoserver/get-new-file');
        var url:string = this.server+'videos/get-new-video';
        console.log('getNewVideo url:', url);
        request.get(url,{json:true},(error, response:http.IncomingMessage, body)=>{

            if(error){
                console.log('getNewVideo error');
                this.isInprocess = false;
                setTimeout(()=>this.getNewVideo(),60000);
                this.onError(error,null);
                return 
            }

            if(body.data){
                console.log('getNewVideo body: ',body.data);
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
            } else {
                 setTimeout(()=>this.getNewVideo(),60000);
                this.onError(body,null);
            }


            // console.log(body)


        });
        return true;
    }
}
