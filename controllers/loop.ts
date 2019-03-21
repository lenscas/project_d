import { Router } from "express";
import easyErrors from "../wrappers/funcs";
import { mpdServer } from "../config";
import { MPC } from 'mpc-js';
import Thing from '../wrappers/things';
import connection from "../wrappers/db";
class mpcPlayer implements Thing {

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

	public volUp() {
		if (this.volume < 100) {
			this.volume += 1;
		}
		this.run(() => { this.mpc.playbackOptions.setVolume(this.volume) })
	}

	public volDown() {
		if (this.volume > 0) {
			this.volume -= 1;
		}
		this.run(() => { this.mpc.playbackOptions.setVolume(this.volume) })
	}

	public setAction(actionIndex: number) {

	}
}

const router: Router = Router();
const insertTime = async(con:connection, kind:string)=>{
	let curTime = new Date().getTime()
	await con.simpleInsert(
		{
			table:"config",
			values: {
				name: kind,
				value: curTime.toString()
			}
		}
	)
	return new Date(curTime)
}
const getTime = async (con: connection,kind:string )=>{
	const timeTBL = await con.find<{value:string}>({table:"config",name:"name",value:kind})
	let time : Date;
	if(timeTBL){
		time = new Date(Number(timeTBL.value))
	} else {
		time = await insertTime(con,kind)
	}
	let now = new Date()
	time.setFullYear(now.getFullYear(),now.getMonth(),now.getDate())
	return time;
}
const isCloseEnough = (now: Date, mustBe:Date) : boolean => {
	let isEarlier = mustBe <= now
	if(isEarlier){
		console.log(now)
		now.setMinutes(now.getMinutes() - 5);
		
		console.log(mustBe)
		return mustBe >= now;
	}
	return false
}
router.get('/', easyErrors(async (_, res,con) => {
	let start = await getTime(con,"start")
	const now = new Date()
	if(isCloseEnough(now,start) ) {
		let player = new mpcPlayer("mpcPlayer1", 0);
		player.switchOn();
		res.send("");
	}
	
}));
export const LoopController: Router = router;