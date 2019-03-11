import { Router } from "express";
import easyErrors from "../wrappers/funcs";
import {mpdServer} from "../config";
import { MPC } from 'mpc-js';


const router: Router = Router();
router.get('/', easyErrors(async (_, res) => {
	const mpc = new MPC()
	await mpc.connectTCP(mpdServer.ip ,mpdServer.port);
	const status = await mpc.status.status()
	await mpc.playbackOptions.setVolume(35)
	if(status.state !== "play"){
		mpc.playback.play();
	} else {
		mpc.playback.stop();
	}
	res.send({
		"stats" : await mpc.status.statistics(),
		"current_song" : await mpc.status.currentSong(),
		"status" : await mpc.status.status()
	})
}));
export const LoopController: Router = router;