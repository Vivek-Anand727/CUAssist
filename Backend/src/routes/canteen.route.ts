import express from "express";
import { uploadMenu, getMenuByCanteen, addReview, getReviewsByCanteen } from "../controllers/canteen.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/upload-menu", authMiddleware,  asyncHandler(uploadMenu));
router.get("/menu/:canteenName", asyncHandler(getMenuByCanteen));
router.post("/add-review", authMiddleware, asyncHandler(addReview));
router.get("/reviews/:canteenName", asyncHandler(getReviewsByCanteen));


export default router;
