import express from "express";
import { login, register , verify,getProfile,logout } from "../controllers/userController.js";
import isLoggedIn from "../middleware/isloggedin.js";


const router = express.Router();


router.post("/register",register);
router.get("/verify/:token",verify);
router.post("/login",login);
router.get("/get-profile",isLoggedIn,getProfile)
router.post("/logout",isLoggedIn,logout);


export default router;