import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

//SELL ITEM 
export const sellItem = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      contactDetails,
      price,
      imageUrl,
      daysToRent,
      status,
    } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: userId missing" });
    }

    if (!title || !contactDetails || !price || !status) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    const newItem = await prisma.item.create({
      data: {
        title,
        description,
        contactDetails,
        price: parseFloat(price),
        imageUrl,
        status,
        daysToRent: status === "FORRENT" ? daysToRent : null,
        ownerId: userId,
      },
    });

    res
      .status(201)
      .json({ message: "Item listed successfully!", item: newItem });
  } catch (err) {
    console.error("Sell Item Error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong while listing the item." });
  }
};

// GET ALL ITEMS - WITHOUT SEARCH FUNCTIONALITY
export const getAllItems = async (req: Request, res: Response) => {
  try {
    const items = await prisma.item.findMany({
      where: {
        status: {
          in: ["AVAILABLE", "FORRENT"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(items);
  } catch (err) {
    console.error("Get All Items Error:", err);
    res.status(500).json({ message: "Failed to fetch items." });
  }
};


//GET SPECIFIC ITEM
export const getItemById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            profilePic: true,
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.status(200).json(item);
  } catch (err) {
    console.error("Get Item By ID Error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

//STATUS CHANGE (AVAILABLE / SOLD)
export const updateItemStatus = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id;
    const { status } = req.body;
    const userId = req.userId;

    if (!status || !["AVAILABLE", "SOLD", "FORRENT"].includes(status)) {
      return res.status(400).json({ message: "Invalid or missing status." });
    }

    const item = await prisma.item.findUnique({ where: { id: itemId } });

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.ownerId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this item." });
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { status },
    });

    res
      .status(200)
      .json({ message: "Item status updated.", item: updatedItem });
  } catch (err) {
    console.error("Update Item Status Error:", err);
    res.status(500).json({ message: "Failed to update item status." });
  }
};

// DELETE ITEM
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id;
    const userId = req.userId;

    const item = await prisma.item.findUnique({ where: { id: itemId } });

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.ownerId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this item." });
    }

    await prisma.item.delete({ where: { id: itemId } });

    res.status(200).json({ message: "Item deleted successfully." });
  } catch (err) {
    console.error("Delete Item Error:", err);
    res.status(500).json({ message: "Failed to delete item." });
  }
};


