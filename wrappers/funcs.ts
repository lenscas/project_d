import {Request,Response, NextFunction } from "express-serve-static-core";
import dbWrapper from "./db"
import {lightServer} from "../config"
import { exec } from'child_process';
export default ( func : (req:Request,res:Response, con: dbWrapper)=> Promise<unknown> )=>{
	return async (req:Request,res:Response, next :NextFunction) => {
		try {
			const answer = await func(req,res,res.locals.connection)
			next(answer)
		} catch(e){
			next(e)
		}
	}
}
export const startLampRest = () => {
	return exec(
		'cd ' + lightServer.configDir +";npm start", 
		(err, stdout, stderr) => {
			if (err) {
				console.log(err)
				// node couldn't execute the command
				return;
			}

			// the *entire* stdout and stderr (buffered)
			console.log(`stdout: ${stdout}`);
			console.log(`stderr: ${stderr}`);
		}
	);
}