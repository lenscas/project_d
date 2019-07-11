import { Router } from "express";
import light from "../things/light";
import { lightServer } from './../config';
import { readFile, writeFile } from "fs"
import { addListener } from "cluster";

const router: Router = Router();
let setIP = (ip: string) => {
    return new Promise((resolve,reject)=>{
        readFile(lightServer.configDir + "/config.js", "utf-8", (err, data) => {
            if(err){
                return reject(err)
            }
            let newData = data.split("\n")
            console.log("split = " + newData)
            newData[0]="{"
            data = newData.join("\n")
            console.log("join = " + data)
            let config = JSON.parse(data)
            config.bridge_ip = ip
            let ct = "module.exports = " + JSON.stringify(config)
            writeFile(lightServer.configDir + "/config.js", ct, (err) => {
                if(err){
                    return reject(err)
                }
                resolve()
            })
        })
    })
        
}
