import { mpdServer } from "../config";
import { MPC } from 'mpc-js';
import Thing from '../wrappers/things';

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
		this.mpc.connectTCP(mpdServer.ip, mpdServer.port)
			.then(() => { 
				this.isDone = true
				this.commandsToRun.forEach( v => v() ) 
			})
			.catch((e)=>{
				//better error handling needed?
				//maybe try to restart mpd (which needs root access......)
				console.error(e)
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

	public updateDB(fun : ()=>void) {
		this.run(()=>{ this.mpc.database.update();fun() })
	}

	public addToPlaylist(URI: string) {
		this.run(()=>{ this.mpc.currentPlaylist.add(URI).catch((e)=>console.error(e))})
	}
}

let player = new mpcPlayer("mpcPlayer1", 0);
player.switchOn();