import express from "express";
import { verifyOTP, resendOTP } from "../controllers/otp.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

router.post("/verify", asyncHandler(verifyOTP));
router.post("/resend-otp", asyncHandler(resendOTP));

export default router;
