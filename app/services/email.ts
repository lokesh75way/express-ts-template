import nodemailer from "nodemailer";
import dotenv from "dotenv";
import type Mail from "nodemailer/lib/mailer";
import createHttpError from "http-errors";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendEmail = async (mailOptions: Mail.Options): Promise<any> => {
  try {
    // eslint-disable-next-line @typescript-eslint/return-await
    return await transporter.sendMail(mailOptions);
  } catch (error: any) {
    createHttpError(500, { message: error.message });
  }
};

export const htmlEmailTemplate = (otp: number): string => `
<html>
  <body>
    <h3>Welcome to app</h3>
    <p>Your verification code is ${otp}</p>
  </body>
</html>`;
