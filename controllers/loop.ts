import { Router } from "express";
import easyErrors from "../wrappers/funcs";
import { mpdServer } from "../config";
import { MPC } from 'mpc-js';

class mpcPlayer implements Thing {

	mpc: MPC
	isDone: boolean
	name: string
	on: boolean
	actionIndex: number
	commandsToRun: Array<() => void>

	public constructor(name: string, actionIndex: number) {

		this.mpc = new MPC()
		this.isDone = false
		this.commandsToRun = [ () => this.mpc.playbackOptions.setVolume(35) ]
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

	public setAction(actionIndex: number) {

	}
}

const router: Router = Router();
router.get('/', easyErrors(async (_, res) => {
let player = new mpcPlayer("mpcPlayer1", 0);
player.switchOn();
res.send("");
}));
export const LoopController: Router = router;