import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // ✅ direct Gmail use
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: message,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;

  } catch (error) {
    throw new Error(error.message || "Cannot send email");
  }
};