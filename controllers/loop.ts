import { Router } from "express";
import easyErrors from "../wrappers/funcs";
import mpcPlayer from "../things/mpcPLayer"
import connection from "../wrappers/db";

const router: Router = Router();
router.get('/', easyErrors(async (_, res) => {
	let player = new mpcPlayer("mpcPlayer1", 0);
	player.newPlaylist(["Dream Catcher.mp3"], "Dream Catcher")
	player.switchOn();
	res.send("");
}))
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