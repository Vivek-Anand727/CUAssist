import express from "express";
import {
    deleteItem,
  getAllItems,
  getItemById,
  sellItem,
  updateItemStatus,
} from "../controllers/item.controller";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

router.get("/", asyncHandler(getAllItems));
router.get("/:id", asyncHandler(getItemById));

router.post("/sell", authMiddleware, asyncHandler(sellItem));
router.patch("/:id/update", authMiddleware, asyncHandler(updateItemStatus));
router.delete("/:id/delete", authMiddleware, asyncHandler(deleteItem));


export default router;
