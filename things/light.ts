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

		this.zone = 1;
		this.isDone = true
		this.commandsToRun = [ ]
    
		this.name = name
		this.actionIndex = actionIndex
		this.on = false
		this.miCommands = mi.commandsV6

	}
	private run(func: () => void) {
		//if (this.isDone) {
			func()
		//} else {
			//this.commandsToRun.push(func)
		//}
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
              const http = require("../wrappers/http").init()
              http.put({
                data : {},
                url : "zones",
                callBack : (v:any)=>{
                    const element = v.data[0]
                    console.log(element)
                    if(element.mode=="off"){
                      return
                    }
                    let data : {[key : string] : any} = {}
                    let newTemp = element.state.temperature - 9;
                    newTemp = newTemp < 0 ? 0 : newTemp;
                    if(element.mode == "white") {
                      data.data = {"mode":"white","state":{"temperature":newTemp}}
                    } else {
                      let as360 = element.state.hue / 255*360;
                      if(as360 > 240){
                        as360 += 20;
                        if(as360 >= 360) {
                          as360 = 0
                        }
                      } else {
                        as360 -= 20;
                        if(as360 <=0){
                          as360 = 0
                        }
                      }
                      element.state.hue = Math.round(as360 / 360 *255)
                      data.data = {"mode": "color", "state":element.state}
                    }
                    data.url = "zones/"
                    console.log(data)
                    data.callBack =(v : any) =>console.log(v)
                    console.log("right before doing it")
                    http.put(data)
                  }
                })
              /*
              http.put(
                {
                  data : {"mode":"color","state":{"hue":100}},
                  url : "zones",
                  callBack : (v:any)=>console.debug(v.data[0].state)
                }
              )
              */
            }
        )
	}

}
