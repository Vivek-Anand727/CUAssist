import  { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // we can also use req.cookies if we want to send the token in cookies
  const authHeader = req.headers.authorization;

  if (!authHeader ) {
     res.status(401).json({ message: "Authorization token missing or invalid." });
     return
  }

  const token = authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    (req as any).userId  = decoded.userId;
    next();
  } catch (err) {
     res.status(403).json({ message: "Invalid or expired token." });
     return
  }
}

    //fix this extend the express request type to include userId
    //ts ignore bhi dal