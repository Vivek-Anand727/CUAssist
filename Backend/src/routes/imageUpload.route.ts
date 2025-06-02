import express from "express";
import parser from "../utils/multerConfig";
import { uploadImage } from "../controllers/imageUpload.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

router.post("/upload", parser.single("image"), asyncHandler(uploadImage));

export default router;
