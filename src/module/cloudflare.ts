import { downloadFile } from "../utils/common"
import cli from 'cli-ux';
import { resolvePathToAppDirectory } from "../utils/utils";
import { execSync } from "child_process";
import path from "path";
import { getProjectConfig } from "../utils/projectConfig";
import { getAppConfig } from "../utils/appConfig";

var {spawn, exec} = require('child_process');
const fs = require('fs')

export class Cloudflare{
     
     static async install(){

        const macURL = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz"

        const recorderZipPath = resolvePathToAppDirectory(
            `cloudflare.tgz`
        );
        const bar = cli.progress({
            format: `Downloading cloudflare tunnel {percentage}%`
        });
        
        bar.start(100, 0, { speed: 'N/A' });

         await downloadFile(macURL,recorderZipPath,bar)
       

        execSync(
            `cd ${path.dirname(recorderZipPath)} && tar -xvzf ${path.basename(
                recorderZipPath
            )} && rm -R ${path.basename(recorderZipPath)} && mv cloudflared bin/cloudflared`,
            { stdio: 'ignore' }
        );
    }

    static runTunnel(){

        return new Promise(async (resolve,rej)=>{
            const cloudflareDFile = resolvePathToAppDirectory(
                'bin/cloudflared'
            )
            if (!fs.existsSync(cloudflareDFile)) {
                console.log("Downloading cloudflared")
                await Cloudflare.install()
            }
            
            var data = getProjectConfig().proxy
            const status = {}
    
            console.log("Creating tunnel")
    
            const tunnelPromises = data.map(({name,url})=>{
                return new Promise((res,rej)=>{
                    var spann = spawn('/Users/crusher/.crusher/bin/cloudflared', [`tunnel --url ${url}`]
                    );     
                    spann.stdout.on('data', function(msg){         
                        console.log(msg.toString(), "sd")
                    });
                    spann.stderr.on('data', function(msg){ 
                       const msgInString = msg.toString()
                        if(msgInString.includes("trycloudflare")){
                            const regex = /https.*trycloudflare.com/g;
                            const found = msgInString.match(regex);
                            if(!!found){
                                status[name] = {url: found}
        
                                res("One tunnel created")
                                console.log(`${name} - ${url} is ${found}`)
                            }
                        }      
                      
                    });
                })
                
            })

            await Promise.all(tunnelPromises);

            resolve("Tunnels live")
            
        })
        
    }
}

