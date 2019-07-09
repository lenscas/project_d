import { mpdServer } from "../config";
//@ts-ignore
import * as mi from 'node-milight-promise';
import Thing from '../wrappers/things';

export default class light implements Thing {

	light: mi
	zone: number
	isDone: boolean
	name: string
	on: boolean
	actionIndex: number
	commandsToRun: Array<() => void>

	public constructor(name: string, actionIndex: number) {

		this.zone = 1;
		this.isDone = false
		this.commandsToRun = [ ]
		mi.discoverBridges({
			address: '10.10.100.255',
			type: 'all'
		}).then((results:any) => {
			console.log(results)
			this.light = new mi.MilightController({
				ip: results[0].ip,
				type: results[0].type
			  })
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
		// this.run(() => { this.mpc.playback.play() })

	}

	public switchOff() {
		this.on = false;
		// this.run(() => { this.mpc.playback.stop() })
	}

	public setAction(actionIndex: number) {
		
	}
}

let lamp = new light("light1", 0);
lamp.switchOn();