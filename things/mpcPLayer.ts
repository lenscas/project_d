import { Router } from "express";
import easyErrors from "../wrappers/funcs";
import { mpdServer } from "../config";
import { MPC } from 'mpc-js';
import Thing from '../wrappers/things';
import readDir from 'fs';

export default class mpcPlayer implements Thing {

	mpc: MPC
	isDone: boolean
	name: string
	on: boolean
	actionIndex: number
	volume: number
	commandsToRun: Array<() => void>

	public constructor(name: string, actionIndex: number) {

		this.mpc = new MPC()
		this.isDone = false
		this.volume = 35
		this.commandsToRun = [ () => this.mpc.playbackOptions.setVolume(this.volume) ]
		this.mpc.connectTCP(mpdServer.ip, mpdServer.port).then(() => { 
			this.isDone = true
			this.commandsToRun.forEach( v => v() ) 
		})

		this.name = name
		this.actionIndex = actionIndex
		this.on = false

	}
	private run(func: () => void) {
		if (this.isDone) {
			func()
		} else {
			this.commandsToRun.push(func)
		}
	}
	public switchOn() {
		this.on = true;
		this.run(() => { this.mpc.playback.play() })

	}

	public switchOff() {
		this.on = false;
		this.run(() => { this.mpc.playback.stop() })
	}
    
    public setVol(vol: number) {
        this.volume = vol;
        this. run(() => { this.mpc.playbackOptions.setVolume(this.volume)})
    }

    public getVol() {
        return this.volume;
    }

    public newPlaylist(playlist: string[], playlistName: string) {
        this.mpc.currentPlaylist.clear;
        playlist.forEach(track => {
            this.mpc.currentPlaylist.add(track)
        });
        this.mpc.storedPlaylists.save(playlistName)
    }

	public setAction(actionIndex: number) {

	}
}

const router: Router = Router();
router.get('/', easyErrors(async (_, res) => {
let player = new mpcPlayer("mpcPlayer1", 0);
player.switchOn();
res.send("");
}));
router.put('/',)
export const LoopController: Router = router;