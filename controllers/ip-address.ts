import { Router } from "express";
import easyErrors, { startLampRest } from "../wrappers/funcs";
import { readFile, writeFile } from "fs";
import { lightServer } from "../config";


const router: Router = Router();

let setIP = (ip: string) => {
    return new Promise((resolve,reject)=>{
        readFile(lightServer.configDir + "/config.js", "utf-8", (err, data) => {
            if(err){
                return reject(err)
            }
            let newData = data.split("\n")
            //console.log("split =" + newData)
            newData[0]="{"
            data = newData.join("\n")
            //console.log("join =" + data)
            let config = JSON.parse(data)
            config.bridge_ip = ip
            let ct = "module.exports = " + JSON.stringify(config, null, "\n")
            writeFile(lightServer.configDir + "/config.js", ct, (err) => {
                if(err){
                    return reject(err)
                }
                resolve()
            })
        })
    })
        
}


router.post("", easyErrors(async (req, res) => {
    var ip_address = req.body.ipaddress;
    await setIP(ip_address);
    res.locals.lamp.kill()
    res.locals.lamp = startLampRest()
    console.log(ip_address);
    res.send(true);
}))


export const IpAdressController: Router = router;
