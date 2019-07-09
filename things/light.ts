import { mpdServer } from "../config";
//@ts-ignore
import * as mi from 'node-milight-promise';
import Thing from '../wrappers/things';


export default class light implements Thing {

	light: any
	zone: number
	miCommands: any
	isDone: boolean
	name: string
	on: boolean
	actionIndex: number
	commandsToRun: Array<() => void>

	public constructor(name: string, actionIndex: number, zone: number) {

		this.zone = zone;
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
		this.miCommands = mi.commandsV6

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
	}

	public switchOff() {
		this.on = false;
	}

	public setAction(actionIndex: number) {
        this.run(
            async ()=>{
                let bb = await this.light.sendCommands(
                    mi.rgbw.on(1),
                )
                console.log(bb)
                let r = 10;
                let b = 10;
                let g = 10;
                var progress = r;
                progress += 1; // of course you can increment faster
                r = progress;
                g = 255 - (255 * (Math.abs(progress-127)/128))
                b = 255 - progress;
                console.log(r,g,b);
                this.light.sendCommands(mi.commands.rgbw.hue(1,20))
            }
        )
	}

}
