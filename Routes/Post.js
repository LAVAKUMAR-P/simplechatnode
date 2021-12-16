import express  from "express";
import { Forgetpassword, GoogleLogin, GoogleRegister, Login, Registeruser, Resetpassword } from "../Controllers/User.js";

import admincheck from "../Middleware/admincheck.js";
import authenticate from "../Middleware/check.js";

const router=express.Router();


router.post("/register",Registeruser);
router.post("/registerbygoogle",GoogleRegister);
router.post("/loginbygoogle",GoogleLogin);
router.post("/login",Login);
router.post("/forgetpassword",Forgetpassword);
router.post('/reset/:userId/:token',Resetpassword);



export default router;