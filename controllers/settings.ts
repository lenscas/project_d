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
router.get('/', (req: Request, res: Response) => {
    // Reply with a hello world when no name param is provided
	res.send('Hello, World!');
});

// Export the express.Router() instance to be used by server.ts
export const SettingsController: Router = router;