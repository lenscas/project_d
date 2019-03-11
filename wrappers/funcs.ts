import {Request,Response, NextFunction } from "express-serve-static-core";
import dbWrapper from "./db"
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