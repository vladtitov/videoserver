
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
        var jsonfile:string = 'asset_'+asset.id+'.json';
        var pattern:string = asset.filename.substr(0,10);
        fs.unlink(WWW+'/ready/'+jsonfile,(err)=>{
            fs.readdir(folder, (err, files:string[])=> {
                if (err) callBack(err);
                else{
                    files.forEach(function(file){
                        if(file.substr(0,10)===pattern)fs.unlink(folder+'/'+file);
                    })
                    callBack();
                }

            });


        });
    }

    onIdle():void{

    }

    sendReady(asset:VOAsset):void{
        asset.status= 'processed';
        var url:string =this.server+'videoserver/ready'
        //console.log(url);
        request.post(url,{json: true,body:asset},(err,res,body)=>{
            // console.log(err);
            // console.log(body);
            if(body.data){
                var asset:VOAsset = new VOAsset(body.data)
                this.isInprocess = false;
                if(asset.id && asset.status=='ready')this.removeAsset(asset,(err)=>{
                    if(err)this.onError(err,asset);

                    console.log('removed '+asset.folder)
                   this.onIdle();
                })
            }

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