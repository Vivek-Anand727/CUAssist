import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader ) {
    return res.status(401).json({ message: "Authorization token missing or invalid." });
  }

  const token = authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    //fix this extend the express request type to include userId
    //ts ignore bhi dal
    (req as any).userId  = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
}
