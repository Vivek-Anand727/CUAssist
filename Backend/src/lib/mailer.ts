import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"CU Assist" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your Email - CU Assist',
    html: `
      <div style="font-family: sans-serif;">
        <h2>Verify your Email</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending verification email to ${to}:`, error);
    // Throw error further so that calling function can handle it too if needed
    throw error;
  }
};
