import express from "express";
import {
  deleteItem,
  getAllItems,
  getItemById,
  getUserItems,
  sellItem,
  updateItemDetails,
} from "../controllers/item.controller";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import parser from "../utils/multerConfig";

const router = express.Router();

router.get("/", asyncHandler(getAllItems));
router.get("/:id", asyncHandler(getItemById));

router.patch("/:id/update", authMiddleware, asyncHandler(updateItemDetails));
router.delete("/:id/delete", authMiddleware, asyncHandler(deleteItem));
router.get("/my-items", authMiddleware, asyncHandler(getUserItems));

router.post("/sell", authMiddleware, parser.single("image"), asyncHandler(sellItem));

export default router;
