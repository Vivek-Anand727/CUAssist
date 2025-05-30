import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { sendVerificationEmail } from "../utils/mailer";
import { generateOTP } from "../helper/otpGenerator";

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { UID, otp } = req.body;
    if (!UID || !otp)
      return res.status(400).json({ message: "UID and OTP are required." });

    const user = await prisma.user.findUnique({ where: { UID } });
    if (!user)
      return res.status(404).json({ message: "User not found." });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified." });

    if (!user.OTP || !user.OTPExpiry)
      return res.status(400).json({ message: "OTP not requested or expired." });

    if (user.OTP !== otp)
      return res.status(400).json({ message: "Invalid OTP." });

    if (user.OTPExpiry < new Date())
      return res.status(400).json({ message: "OTP has expired." });

    await prisma.user.update({
      where: { UID },
      data: { isVerified: true, OTP: null, OTPExpiry: null },
    });

    return res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { UID } = req.body;
    if (!UID) return res.status(400).json({ message: "UID is required." });

    const user = await prisma.user.findUnique({ where: { UID } });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.isVerified)
      return res.status(400).json({ message: "User is already verified." });

    const now = new Date();
    const lastSent = user.OTPExpiry
      ? new Date(user.OTPExpiry.getTime() - 10 * 60 * 1000)
      : null;

    if (lastSent && now.getTime() - lastSent.getTime() < 2 * 60 * 1000) {
      const secondsLeft = Math.ceil(
        (2 * 60 * 1000 - (now.getTime() - lastSent.getTime())) / 1000
      );
      return res.status(429).json({
        message: `Please wait ${secondsLeft} seconds before requesting a new OTP.`,
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(now.getTime() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { UID },
      data: { OTP: otp, OTPExpiry: otpExpiry },
    });

    const email = `${UID.trim().toLowerCase()}@cuchd.in`;
    await sendVerificationEmail(email, otp);

    return res.status(200).json({ message: "OTP resent to your email." });
  } catch (error) {
    return res.status(500).json({ message: "Error resending OTP: " + error });
  }
};
