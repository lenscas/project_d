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

/*
import light from "./things/light";

const lamp = new light("a", 1)
lamp.setAction(10)
*/
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

app.listen(server.port, () => {
    // Success callback
    console.log(`Listening at http://localhost:${server.port}/`);
});

