import {db,server} from "./config"
import * as mysql from 'promise-mysql'
import express from "express"
import dbWrapper from "./wrappers/db"
import fileUpload from "express-fileupload"
import cors from "cors"

var bodyParser = require('body-parser')

import { WelcomeController } from "./controllers/welcome"
import { SettingsController } from "./controllers/settings"
import { LoopController } from "./controllers/loop";
import { AudioController } from "./controllers/audio";
import { IpAdressController } from "./controllers/ip-address";
import mpcPlayer from "./things/mpcPLayer";
import Light from "./things/light";
import {startLampRest} from "./wrappers/funcs"

/*

const lamp = new light("a", 1)
lamp.setAction(10)
*/
let lamp = startLampRest()
const connection =  mysql.createPool({
    host: db.host,
	user: db.user,
    password: db.password,
    database: db.database
})

const app = express();

app.use(cors({credentials: true, origin: true}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(fileUpload({
	useTempFiles : true,
	tempFileDir : "/tmp/",
	safeFileNames: true,
	preserveExtension: true,
	
}))

app.use(async function(_,res,next){
	res.on("close",()=>{
		res.locals.connection.release()
		if(!res.headersSent){
			res.send({error:"There was an unknown problem."})
			res.end()
		}
	})
	try {
		res.locals.connection = new dbWrapper(connection);
		res.locals.lamp = lamp;
		next()
	} catch (e) {
		console.error(e)
		//res.sendStatus(500)
		//res.send({error:"Couldn't connecto to the database",data:e})
		next({error:"Couldn't connect to the database",data:e})
	}

})
app.use("/welcome",WelcomeController);

app.use("/settings",SettingsController);

app.use("/loop",LoopController);

app.use("/audio",AudioController);

app.use("/ipaddress",IpAdressController);

app.listen(server.port, () => {
    // Success callback
    console.log(`Listening at http://localhost:${server.port}/`);
});
const insertTime = async(con:dbWrapper, kind:string)=>{
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
const getTime = async (con: dbWrapper,kind:string )=>{
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
const isCloseEnough = (now: Date, mustBe:Date) => {
	let isEarlier = mustBe <= now
	if(isEarlier){
		console.log(now)
		now.setSeconds(now.getSeconds() - 2);
		const isFirst = mustBe >=now;
		now.setHours(now.getHours()-1);
		const isInHours = mustBe >=now;
		console.log(mustBe)
		return {
			isFirst : isFirst,
			isInHours : isInHours
		}
	}
	return false
}
setInterval(async ()=>{
	const con = new dbWrapper(connection);
	let start = await getTime(con,"start")
	const now = new Date()
	const res = isCloseEnough(now,start) 
	if(res) {
		if(res.isFirst){
			let player = new mpcPlayer("mpcPlayer1", 0);
			player.switchOn();
		}
		let light = new Light("light",0,0);
		light.setAction(1);
	}
}, 6000)

