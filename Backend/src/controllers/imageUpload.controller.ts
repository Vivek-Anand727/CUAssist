import { Request, Response } from "express";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided." });
    }

    const imageUrl = (req.file as Express.Multer.File).path;

    res.status(200).json({
      message: "Image uploaded successfully!",
      imageUrl,
    });
  } catch (error) {
    console.error("Image Upload Error:", error);
    res.status(500).json({ message: "Image upload failed." });
  }
};
