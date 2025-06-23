import nodemailer from "nodemailer";
import { config } from "../configs";
import ejs from "ejs";
import path from "path";

export default class Mailer {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "smtp", // or use host, port, and secure for custom SMTP
      host: "smtp.titan.email",
      port: 465,
      secure: true,
      auth: {
        user: config.EMAIL.SMTP_USER, // your email address
        pass: config.EMAIL.SMTP_PASS, // app password or real password (use ENV!)
      },
    });
  }

  sendWelcomeEmail = async ({
    name,
    email,
    appName,
    loginUrl,
  }: {
    name: string | null;
    email: string;
    appName: string;
    loginUrl: string;
  }) => {
    const year = new Date().getFullYear();

    // Render EJS template
    const html = await ejs.renderFile(
      path.join(__dirname, "./templates/welcome.ejs"),
      { name, email, appName, loginUrl, year }
    );

    // Send email
    await this.transporter.sendMail({
      from: config.EMAIL.SMTP_USER,
      to: email,
      subject: `Welcome to ${appName}!`,
      html,
    });

    console.log(`✅ Welcome email sent to ${email}`);
  };

  sendPasswordRestOtp = async ({
    name,
    email,
    resetUrl,
  }: {
    name: string | null;
    email: string;
    resetUrl: string;
  }) => {
    const year = new Date().getFullYear();

    // Render HTML from EJS template
    const html = await ejs.renderFile(
      path.join(__dirname, "../emails/password-reset.ejs"),
      { name, email, appName: config.APP_NAME, resetUrl, year }
    );

    // Send the email
    await this.transporter.sendMail({
      from: config.EMAIL.SMTP_USER,
      to: email,
      subject: `Reset Your ${config.APP_NAME} Password`,
      html,
    });

    console.log(`✅ Password reset email sent to ${email}`);
  };
}
