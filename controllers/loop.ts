import { Router } from "express";
import easyErrors from "../wrappers/funcs";
import mpcPlayer from "../things/mpcPLayer"

const router: Router = Router();
router.get('/', easyErrors(async (_, res) => {
	let player = new mpcPlayer("mpcPlayer1", 0);
	player.newPlaylist(["Dream Catcher.mp3"], "Dream Catcher")
	player.switchOn();
	res.send("");
}));
export const LoopController: Router = router;