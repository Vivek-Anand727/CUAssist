import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from "../lib/prisma";

import dotenv from 'dotenv';
import { sendVerificationEmail } from '../lib/mailer';
dotenv.config();

const router = express.Router();

interface SignUpRequestBody {
  username: string;
  UID: string;
  password: string;
  profilePic?: string; 
  role?: 'STUDENT' | 'ADMIN' | 'SENIOR'; 
}

interface LoginRequestBody {
  UID: string;
  password: string;
}

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/signup', (req: Request, res: Response) => {
  (async () => {
    try {
      const {
        username,
        UID,
        password,
        profilePic = null,
        role = 'STUDENT'
      } = req.body as SignUpRequestBody;

      if (!username || !UID || !password || !role) {
        return res.status(400).json({ message: 'Username, UID, password, and role are required!' });
      }

      // UID validation: length 10, pattern like 23BCS11598 (2 digits + 3 letters + 5 digits)
      const uidRegex = /^\d{2}[a-zA-Z]{3}\d{5}$/;
      if (UID.length !== 10) {
        return res.status(400).json({ message: 'UID must be exactly 10 or 11 characters long' });
      }
      if (!uidRegex.test(UID)) {
        return res.status(400).json({ message: 'UID format is invalid. Expected format example: 23BCS11598' });
      }

      if (password.length < 4) {
        return res.status(400).json({ message: 'Password must be at least 4 characters long' });
      }

      const existingUser = await prisma.user.findUnique({ where: { UID } });
      if (existingUser) {
        return res.status(400).json({ message: 'UID already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      const newUser = await prisma.user.create({
        data: {
          username,
          UID,
          password: hashedPassword,
          role,
          profilePic,
          OTP: otp,
          OTPExpiry: otpExpiry,
        },
      });

      
      const email = `${UID.trim().toLowerCase()}@cuchd.in`;
      await sendVerificationEmail(email, otp); //OTP being send from here

      res.status(201).json({ message: 'User registered. OTP sent to your email.' });
    } catch (error) {
      console.error("Signup error:", error);
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

      res.json({
        token,
        username: user.username,
        role: user.role,
        profilePic: user.profilePic
      });
    } catch (error) {
      res.status(500).json({ message: '!!! Login error !!! , ' + error });
    }
  })();
});


//OTP Verification
router.post('/verify', (req: Request, res: Response) => {
  (async () => {
    try {
      const { UID, otp } = req.body;

      if (!UID || !otp) {
        return res.status(400).json({ message: 'UID and OTP are required.' });
      }

      const user = await prisma.user.findUnique({ where: { UID } });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: 'User already verified.' });
      }

      if (!user.OTP || !user.OTPExpiry) {
        return res.status(400).json({ message: 'OTP not requested or expired.' });
      }

      const now = new Date();
      if (user.OTP !== otp) {
        return res.status(400).json({ message: 'Invalid OTP.' });
      }

      if (user.OTPExpiry < now) {
        return res.status(400).json({ message: 'OTP has expired.' });
      }

      await prisma.user.update({
        where: { UID },
        data: {
          isVerified: true,
          OTP: null,
          OTPExpiry: null,
        },
      });

      res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ message: 'Server error during verification.' });
    }
  })();
});

export default router;
