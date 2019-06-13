import { Router } from "express";
import easyErrors from "../wrappers/funcs";
import mpcPlayer from "../things/mpcPLayer"
import { mpdServer } from './../config';

const router: Router = Router();
let player = new mpcPlayer("mpcPlayer1", 0);

type songPathWithSuccess = { path: string, success: boolean }
type songPathsWithSuccess = { paths: string[], success: boolean }

router.get('/volume', easyErrors(async (req, res) => {
    res.send( { volume : player.getVol() });
}))

router.put('/volume', easyErrors(async (req, res) => {
    
    if (req.body.volume || req.body.volume === 0) {
        player.setVol(req.body.volume)
    }
    res.send({ volume : player.getVol() });
}));

router.put('/upload', easyErrors((req, res) => {
    return new Promise(async (resolve)=>{
    if(req.files && req.files.audioTrack){
       if ("name" in req.files.audioTrack){
           req.files.audioTrack = [req.files.audioTrack]
       }
       let count =  req.files.audioTrack.length;
       let results : Array<songPathWithSuccess> = [];
       let after = ()=>{
           count--
           if(count !=0){
            return
           }
           let result = results.reduce<songPathsWithSuccess>((success, result)=> {
               success.paths.push(result.path)
               success.success = !success.success ? success.success : result.success
               return success
           } , {paths:[], success : true})
           if(result.success){
               res.send("Track uploaded successfully! :)")
               player.updateDB(()=> result.paths.forEach(v=>player.addToPlaylist(v)))
           }
           else{
               res.send("Upload failed :(")
           }
           resolve()
       }
       req.files.audioTrack.forEach(async track => {
        try{   
            console.log(track.name)
            await track.mv(mpdServer.musicDir + "/" + track.name)
            results.push({path : track.name, success : true})
        }
        catch(e){
            console.error(e)
            results.push({path : track.name, success : false})
        }
        after()
       })
    }})
    
}))

export const AudioController: Router = router;