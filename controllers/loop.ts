import { Router } from "express";
import easyErrors from "../wrappers/funcs";
import mpcPlayer from "../things/mpcPLayer"
import connection from "../wrappers/db";

const router: Router = Router();

// var CronJob = require('cron').CronJob;
// new CronJob('*/1 * * * *', function() {
//   console.log('You will see this message every one minute');
// }, null, true, 'Europe/Amsterdam');

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
router.post('/', easyErrors(async (req, res,con) => {
	if(req.body.time){
		if(await con.find({
			table : "config",
			name : "name",
			value : "start"
		})) {
			await con.query({
				sql : "UPDATE config SET value=? WHERE name='start'",
				values : [req.body.time]
			})
		} else {
			await con.simpleInsert({
				table : "config",
				values : {
					name : "start",
					value : req.body.time
				}
			})
		}
		res.send(true)
	} else {
		res.send(false)
	}
	
	
}));
export const LoopController: Router = router;