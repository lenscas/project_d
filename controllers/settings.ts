// Import only what we need from express
import { Router, Request, Response } from 'express';
import { PoolConnection } from 'promise-mysql';
import db from '../wrappers/db';
import easyErrors from "../wrappers/funcs";
// Assign router to the express.Router() instance
const router: Router = Router();

// The / here corresponds to the route that the WelcomeController
// is mounted on in the server.ts file.
// In this case it's /settings
router.post('/time', easyErrors( async (req,res, con) => {
	if(req.body.new_time) {
		const found = await con.find({
			table : "config",
			name : "name",
			value : "start"
		})
		if(!found){
			await con.simpleInsert({
				table : "config",
				values : {
					name : "start",
					value : req.body.new_time
				}
			})
		} else {
			await con.query({
				sql : 'UPDATE config SET value=? WHERE name="start" LIMIT 1',
				values : [req.body.new_time]
			})
		}
		res.send({success:true})
	}
}));

// Export the express.Router() instance to be used by server.ts
export const SettingsController: Router = router;