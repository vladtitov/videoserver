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
       this.readInQueue();
       this.loadInProcess();
    }

    registerReady(asset:VOAsset):void{
        asset.status='processed';
        this.sendReady(asset)
        var jsonfile:string = 'asset_'+asset.id+'.json';

        fs.writeFile(path.resolve(WWW+'/ready/'+jsonfile),JSON.stringify(asset), (err)=> {
            if(err) return this.onError(err,asset)
        });

    }

    inProcess:VOAsset[];
    private saveInProcess():void{
        fs.writeFile(path.resolve('inprocess.json'),JSON.stringify(this.inProcess), (err)=> {
            if(err) return  this.onError(err,null);  
                
        });
    }
    private addInProcess(asset:VOAsset):boolean{
        this.inProcess.push(asset);
        this.saveInProcess();
        return true;
    }
    private loadInProcess():void{
          if(fs.existsSync('inprocess.json')) this.inProcess =JSON.parse(fs.readFileSync('inprocess.json','utf8'));
          else this.inProcess=[];
    }
    downloadAsset(asset:VOAsset):void{

        var dwd:FileDownloader = new FileDownloader(asset,this.server);
        dwd.onComplete = (err)=>{
            if(err) return this.onError(err,asset);

            var processor:VideoProcess = new VideoProcess(null);
            if(this.addInProcess(asset)){
                processor.processVideo(asset).done(
                asset=>this.registerReady(asset)
                ,err=>this.onError(err,asset)
            )
            }
           
        }
        dwd.getFile();
    }

    onError(err:any,asset:VOAsset):void {

        console.error('onError '+ new Date().toLocaleString());
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


    removefromQueue(id:number):void{
        var ind:number = this.inqueue.indexOf(id);
          if(ind!==-1)return;
          this.inqueue.splice(ind,1);
          this.saveInQueue();      
    }

    converVideo(path:string):void{
          var processor:VideoProcess = new VideoProcess(null);
          processor.convertVideoByPath(path);
    }

private readInQueue():void{
    var str:string;
    if(fs.existsSync('inqueue.json')) str = fs.readFileSync('inqueue.json','utf8')
    
    if(str)this.inqueue = JSON.parse(str);
    else this.inqueue=[];
}
private saveInQueue():void{
 fs.writeFile(path.resolve('inqueue.json'),JSON.stringify(this.inqueue), (err)=> {
            if(err) return  this.onError(err,null);  
            console.log('saved',this.inqueue)         
        });
}
inqueue:number[];

    addInQueue(id:number):boolean{
        if(this.inqueue.indexOf(id) !==-1)return false;
        this.inqueue.push(id);
        this.saveInQueue();
        return true;
        
    }
    videoStatus:string ='newvideo';
    getNewVideo(id?:number){

    if(id){        
        this.addInQueue(id);

    }

        if(this.isInprocess) return;
        this.isInprocess = true;

//console.log(this.server+'videoserver/get-new-file');
        var url:string = this.server+'videos/get-new-file/'+this.videoStatus;

        request.get(url,{json:true},(error, response:http.IncomingMessage, body)=>{
           // console.log(body);
           
            if(error){
                this.isInprocess = false;
                setTimeout(()=>this.getNewVideo(),60000);
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
            } else {
                 setTimeout(()=>this.getNewVideo(),60000);
                this.onError(body,null);
            }


            // console.log(body)


        });

    }
}
