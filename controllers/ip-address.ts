import { Router } from "express";
import easyErrors from "../wrappers/funcs";


const router: Router = Router();

router.post("", easyErrors(async (req, res) => {
    var ip_address = req.body.ipaddress;
    console.log(ip_address);
    res.send(true);
}))


export const IpAdressController: Router = router;