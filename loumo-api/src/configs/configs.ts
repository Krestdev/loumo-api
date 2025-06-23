import dotenv from "dotenv";

dotenv.config();

const env = process.env;

const config = {
  APP_NAME: env["APP_NAME"] ?? "LOUMO",
  NODE_ENV: env["NODE_ENV"] ?? "dev",
  PORT: env["PORT"] ?? 5000, // set
  BASE_URL: env["BASE_URL"] ?? "", //
  FRONTEND_URL: env["FRONTEND_URL"] ?? "",
  PAWAPAY: {
    API_TOKEN: env["PAWAPAY_API_TOKEN"] ?? "",
    BASE_URL: env["PAWAPAY_BASE_URL"] ?? "",
  },
  MAIN_DATABASE: {
    URL: env["MAIN_DATABASE_URL"] ?? "",
    USER: env["MAIN_DATABASE_USER"] ?? "",
    PASSWORD: env["MAIN_DATABASE_PASSWORD"] ?? "",
  },
  LOG_DATABASE: {
    URL: env["LOG_DATABASE_URL"] ?? "",
    USER: env["MAIN_DATABASE_USER"] ?? "",
    PASSWORD: env["MAIN_DATABASE_PASSWORD"] ?? "",
  },
  JWT: {
    EXPIRATION: Math.floor(Date.now() / 1000) + 60 * 60, //1h
    COOKIE_EXPIRATION: 360,
    SECRET: process.env["JWT_SECRET"] ?? "your_jwt_secret",
  },
  EMAIL: {
    SMTP_USER: env["SMTP_USER"] ?? "",
    SMTP_PASS: env["SMTP_PASS"] ?? "",
  },
};

export default config;
