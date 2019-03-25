import { Router } from "express";
import easyErrors from "../wrappers/funcs";
import mpcPlayer from "../things/mpcPLayer"
import { mpdServer } from './../config';


const router: Router = Router();
let player = new mpcPlayer("mpcPlayer1", 0);

router.get('/volume', easyErrors(async (req, res) => {
    res.send( { volume : player.getVol() });
}))

router.put('/volume', easyErrors(async (req, res) => {
    
    if (req.body.volume || req.body.volume === 0) {
        player.setVol(req.body.volume)
    }
    res.send({ volume : player.getVol() });
}));

router.put('/upload', easyErrors(async (req, res) => {
    if(req.files && req.files.audioTrack){
       if ("name" in req.files.audioTrack){
           req.files.audioTrack = [req.files.audioTrack]
       }
       req.files.audioTrack.forEach(track => track.mv(mpdServer.musicDir + "/" + track.name))
    }
    res.send("Track maybe uploaded successfully")
}))

export const AudioController: Router = router;