import {db,server} from "./config"
import * as mysql from 'promise-mysql'
import express from "express"
import dbWrapper from "./wrappers/db"

import {WelcomeController} from "./controllers/welcome"
import {SettingsController} from "./controllers/settings"

const connection =  mysql.createPool({
    host: db.host,
	user: db.user,
    password: db.password,
    database: db.database
})
const app = express();
app.use(async function(_,res,next){
	res.on("close",()=>{
		res.locals.connection.release()
		if(!res.headersSent) {
			res.end({error:"There was an unknown problem."})
		}
	})
	try {
		res.locals.connection = new dbWrapper(connection);
		next()
	} catch (e) {
		console.error(e)
		//res.sendStatus(500)
		//res.send({error:"Couldn't connecto to the database",data:e})
		next({error:"Couldn't connecto to the database",data:e})
	}

})
app.use("/welcome",WelcomeController);
app.use("/settings",SettingsController);
app.listen(server.port, () => {
    // Success callback
    console.log(`Listening at http://localhost:${server.port}/`);
});