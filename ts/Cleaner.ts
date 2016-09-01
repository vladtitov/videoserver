
/**
 * Created by Vlad on 8/25/2016.
 */
declare var WWW:string
import {VOAsset} from "./models";

import * as path from 'path'
import * as http from 'http';
import * as fs from 'fs';
import * as request from 'request';

export class Cleaner{

    server:string;
    isInprocess:boolean;
    onError(err:any,asset:VOAsset):void{

    }

    removeAsset(asset:VOAsset,callBack:Function):void{

        var folder:string = path.resolve(WWW+'/'+asset.folder);
        var pattern:string = asset.filename.substr(0,10);
        fs.readdir(folder, (err, files:string[])=> {
            if (err) callBack(err);
            else{

                files.forEach(function(file){
                    if(file.substr(0,10)===pattern)fs.unlink(folder+'/'+file);
                })
                callBack();
            }

        });
    }

    onIdle():void{

    }

    removeProcessById(id:number){ }



    sendProcessed(asset:VOAsset):void{
        console.log('sendProcessed');
        asset.status= 'processed';
        // var url:string =this.server+'videoserver/processed';
        var url:string =this.server+'videos/processed';
        console.log(url);
        var asset1 = new VOAsset(asset);
        delete  asset1.workingFolder;
        delete  asset1.errorCount;
        request.post(url,{json: true,body:asset1},(err,res,body)=>{
            // console.log(err);
            // console.log(body);
            if(body.data){
                var asset2:VOAsset = new VOAsset(body.data);
                this.isInprocess = false;
                if(asset2.id && asset2.status=='ready') this.removeAsset(asset,(err)=>{
                    if(err)this.onError(err,asset);

                    this.removeProcessById(asset.id);

                    console.log('removed '+asset.folder)
                   this.onIdle();
                })
            } else setTimeout(()=>this.sendProcessed(asset),60000);

        })
    }


    checkStatus(asset:VOAsset):void{
        var url:string =this.server+'videoserver/get-status/'+asset.id;

        request.get(url,{json:true},(error, response:http.IncomingMessage, body)=> {
            console.log(body)

            if (error) {
                this.onError(error, null);
                return
            }

            if(body.data && body.data.status=='ready'){
                this.removeAsset(asset,(err)=>{
                    if(err)this.onError(err, asset);
                });
            }

        });
    }
}