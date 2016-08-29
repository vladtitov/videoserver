/**
 * Created by Vlad on 8/25/2016.
 */
import {VOAsset} from "../../client/app/services/models";

import * as path from 'path'
import * as http from 'http';
import * as fs from 'fs';

export class FileDownloader{

    destination:string;

    onComplete:Function;
    constructor(private asset:VOAsset,private server:string){




    }

    getFile():void{
        this.downloader((err)=>{
            if(this.onComplete) this.onComplete(err)
        })
    }



    downloader(callBack:Function):void{
        var dest = path.resolve(this.asset.workingFolder+'/'+this.asset.filename);
        var file = fs.createWriteStream(dest);
        var url:string = this.server+'/'+this.asset.path;
        console.log(url);


        http.get(url,function(response){
            response.pipe(file);
            file.on('finish', function() {
                file.close();  // close() is async, call cb after close completes.
                callBack();
            }).on('error', function(err) {
                fs.unlink(dest);
                if (callBack) callBack(err);
            });
        } )
    }
}
