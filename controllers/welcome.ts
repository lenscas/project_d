// Import only what we need from express
import { Router, Request, Response } from 'express';
import { PoolConnection } from 'promise-mysql';
import db from '../wrappers/db';
import easyErrors from "../wrappers/funcs";
// Assign router to the express.Router() instance
const router: Router = Router();

// The / here corresponds to the route that the WelcomeController
// is mounted on in the server.ts file.
// In this case it's /welcome
router.get('/', (req: Request, res: Response) => {
    // Reply with a hello world when no name param is provided
	res.send('Hello, World!');
});

router.get('/:name', (req: Request, res: Response) => {
    // Extract the name from the request parameters
    let { name } = req.params;

    // Greet the given name
    res.send(`Hello, ${name}`);
});
router.get("/db/:name/:value",async (req,res,next) => {
    try{
        const con : db = res.locals.connection;
        await con.simpleInsert({
            table : "Config",
            values : {
                "ConfigField" : req.params.name,
                "Field"       : req.params.value
            }
        })
    }
    catch(e){
        next(e)
    }
    next()
})
router.get("/simple/db/:name/:value",easyErrors( async (req,res,con)=>{
    await con.simpleInsert({
        table: "Config",
        values : {
            "ConfigField" : req.params.name,
            "Field"       : req.params.value
        }
    })
    console.log("after insert")
    res.send({done:true,errors:false})
}))
// Export the express.Router() instance to be used by server.ts
export const WelcomeController: Router = router;