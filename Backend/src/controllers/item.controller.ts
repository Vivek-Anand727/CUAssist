import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

//SELL ITEM
export const sellItem = async (req: Request, res: Response) => {
  try {
    const { title, description, contactDetails, price, daysToRent, status } =
      req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: userId missing" });
    }

    if (!title || !contactDetails || !price || !status) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    const imageUrl = req.file?.path || "";

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

// GET ALL ITEMS - WITH SEARCH FUNCTIONALITY
export const getAllItems = async (req: Request, res: Response) => {
  try {
    const {
      status,
      search,
      minPrice,
      maxPrice,
      page = "1",
      limit = "10",
    } = req.query;

    const filters: any = {}; //  FIX : ANY

    if (status && typeof status === "string") {
      filters.status = status.toUpperCase();
    } else {
      filters.status = { in: ["AVAILABLE", "FORRENT"] };
    }

    if (search && typeof search === "string") {
      filters.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) {
        filters.price.gte = parseFloat(minPrice as string); // gte -> greater than or equal to
      }
      if (maxPrice) {
        filters.price.lte = parseFloat(maxPrice as string); //lte -> less than or equal to
      }
    }

    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const skip = (pageNumber - 1) * pageSize;

    const items = await prisma.item.findMany({
      where: filters,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    });

    const totalItems = await prisma.item.count({
      where: filters,
    });

    res.status(200).json({
      items,
      totalItems,
      page: pageNumber,
      totalPages: Math.ceil(totalItems / pageSize),
    });
  } catch (err) {
    console.error("Get All Items with Filters Error:", err);
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

//UPDATE ITEM
export const updateItemDetails = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id;
    const userId = req.userId;

    const { title, description, contactDetails, price, status, daysToRent } =
      req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: userId missing" });
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

    if (status && !["AVAILABLE", "SOLD", "FORRENT"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const imageUrl = req.file?.path;

    const dataToUpdate: any = {}; // FIX : ANY

    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (contactDetails) dataToUpdate.contactDetails = contactDetails;
    if (price) dataToUpdate.price = parseFloat(price);
    if (status) dataToUpdate.status = status;
    if (status === "FORRENT") {
      dataToUpdate.daysToRent = daysToRent || null;
    } else {
      dataToUpdate.daysToRent = null;
    }
    if (imageUrl) {
      dataToUpdate.imageUrl = imageUrl;
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: dataToUpdate,
    });

    res
      .status(200)
      .json({ message: "Item updated successfully.", item: updatedItem });
  } catch (err) {
    console.error("Update Item Details Error:", err);
    res.status(500).json({ message: "Failed to update item." });
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

// GET ITEMS BY USER
export const getUserItems = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: userId missing" });
    }

    const items = await prisma.item.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ items });
  } catch (err) {
    console.error("Get User Items Error:", err);
    res.status(500).json({ message: "Failed to fetch your items." });
  }
};
