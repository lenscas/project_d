import { mpdServer } from "../config";
import { MPC } from 'mpc-js';
import Thing from '../wrappers/things';

import {exec} from "child_process";
import { resolve, reject } from "bluebird";

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

	public getList() {
		return new Promise( (resolve,reject) => {
			this.run(async ()=>{
				resolve(
					{
						currentSong: await this.mpc.status.currentSong(),
						list : await this.mpc.currentPlaylist.playlistInfo()
					}
				)
			})
		})
		
	}
	public setAction(actionIndex: number) {
		
	}

	public updateDB(fun : ()=>void) {
		this.run(()=>{ this.mpc.database.update().then(fun).catch(fun) })
	}

	public addToPlaylist(URI: string) {
		
		// let n = URI.lastIndexOf(".");
    	// let cutURI = URI.substring(0, n);
		// this.run( ()=>{ this.mpc.currentPlaylist.add(cutURI).catch((e)=>console.error(e)) } )
		console.log(URI)
		let sys = require("sys")
		let exec = require("child_process").exec
		let child
		child = exec("mpc update --wait && mpc add " + URI ,function (error: any, stdout: any, stderr: any){
		console.log(stdout)
		console.error(stderr)
		})

	}
}

let player = new mpcPlayer("mpcPlayer1", 0);
player.switchOn();