import express from "express";
import { signup, login } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();


// jo bhi controllers banaoge unhe iss asyncHandler() mai pass kardena
//warna jab kisi point pe return res.status(xx).json(..) karoge to yaha typescript 
//error dega ki return type response nahi ho sakti, ie use iske return type mai convert karna padega
router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));

export default router;
