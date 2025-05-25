import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from "../lib/prisma";


import dotenv from 'dotenv';
dotenv.config();


const router = express.Router();


interface SignUpRequestBody {
  username: string;
  UID: string;
  password: string;
}

interface LoginRequestBody {
  UID: string;
  password: string;
}

// Sign Up
router.post('/signup', (req: Request, res: Response) => {
  (async () => {
    try {
      const { username, UID, password } = req.body as SignUpRequestBody;

      if (!username || !UID || !password){
        return res.status(400).json({ message: 'Username, UID and password are required!' });
      }

      if (password.length < 4){
        return res.status(400).json({ message: 'Password must be atleast 4 characters long' });
      }

      const existingUser = await prisma.user.findUnique({ where: { UID } });
      if (existingUser){
        return res.status(400).json({ message: 'UID already exists' }); // FUTURE WORK: REPORT ERROR TO DEVELOPERS
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: { username, UID, password: hashedPassword },
      });

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: '!!! Sign Up Error !!! , ' + error });
    }
  })();
});



// Login
router.post('/login', (req: Request, res: Response) => {
  (async () => {
    try {
      const { UID, password } = req.body as LoginRequestBody;

      if (!UID || !password) {
        return res.status(400).json({ message: 'UID and password are required!' });
      }

      const user = await prisma.user.findUnique({ where: { UID } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials. User does not exist' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid Password' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: '5h',
      });

      res.json({ token, username: user.username });
    } catch (error) {
      res.status(500).json({ message: '!!! Login error !!! , ' + error });
    }
  })();
});

export default router;


