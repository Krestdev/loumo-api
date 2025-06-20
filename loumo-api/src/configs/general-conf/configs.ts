import dotenv from "dotenv";

dotenv.config();

const env = process.env;

const config = {
  PORT: env["PORT"] ?? 8002,
  BASE_URL: env["BASE_URL"] ?? "",
  REDIS_SERVER: env["REDIS_SERVER"] ?? "",
  PAY_SERVER: env["PAY_SERVER"] ?? "",
  MYSQL: {
    MYSQL_SERVER: env["MYSQL_SERVER"] ?? "",
    MYSQL_USER: env["MYSQL_USER"] ?? "",
    MYSQL_PASSWORD: env["MYSQL_PASSWORD"] ?? "",
    MYSQL_DATABASE: env["MYSQL_DATABASE"] ?? "",
  },
  MONGDB: {
    SERVER_URI: env["SERVER_URI"] ?? "",
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
  NODE_ENV: env["NODE_ENV"] ?? "dev",
};

export default config;
