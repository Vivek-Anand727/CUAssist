import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { sendVerificationEmail } from "../utils/mailer";
import { generateOTP } from "../helper/otpGenerator"

interface SignUpRequestBody {
  username: string;
  UID: string;
  password: string;
  profilePic?: string;
  role?: "STUDENT" | "ADMIN" | "SENIOR";
}

interface LoginRequestBody {
  UID: string;
  password: string;
}

export const signup = async (req: Request, res: Response) => {
  try {
    const {
      username,
      UID,
      password,
      profilePic = null,
      role = "STUDENT",
    } = req.body as SignUpRequestBody;

    if (!username || !UID || !password || !role) {
      return res
        .status(400)
        .json({ message: "Username, UID, password, and role are required!" });
    }

    const uidRegex = /^\d{2}[a-zA-Z]{3}\d{5}$/;
    if (UID.length !== 10 || !uidRegex.test(UID)) {
      return res.status(400).json({
        message: "UID must be in format like 23BCS11598 and be 10 characters long",
      });
    }

    if (password.length < 4) {
      return res
        .status(400)
        .json({ message: "Password must be at least 4 characters long" });
    }

    const existingUser = await prisma.user.findUnique({ where: { UID } });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);
    const email = `${UID.trim().toLowerCase()}@cuchd.in`;

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "UID already exists" });
      }

      await prisma.user.update({
        where: { UID },
        data: {
          username,
          password: hashedPassword,
          profilePic,
          role,
          OTP: otp,
          OTPExpiry: otpExpiry,
        },
      });

      await sendVerificationEmail(email, otp);
      return res.status(200).json({
        message: "UID already registered but not verified. New OTP sent.",
      });
    }

    await prisma.user.create({
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

    await sendVerificationEmail(email, otp);
    res.status(201).json({ message: "User registered. OTP sent to your email." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Sign Up Error: " + error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { UID, password } = req.body as LoginRequestBody;

    if (!UID || !password) {
      return res.status(400).json({ message: "UID and password are required!" });
    }

    const user = await prisma.user.findUnique({ where: { UID } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid UID or Password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "5h",
    });

    res.json({
      token,
      username: user.username,
      role: user.role,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ message: "Login error: " + error });
  }
};

