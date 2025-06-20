import nodemailer from "nodemailer";
import { config } from "../configs";

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "smtp", // or use host, port, and secure for custom SMTP
    host: "smtp.titan.email",
    port: 465,
    secure: true,
    auth: {
      user: config.EMAIL.SMTP_USER, // your email address
      pass: config.EMAIL.SMTP_PASS, // app password or real password (use ENV!)
    },
    // tls: {
    //   rejectUnauthorized: false,
    // },
  });

  const mailOptions = {
    from: `"WinterCode Team" <${config.EMAIL.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("📨 Email sent:", info.messageId);
}
