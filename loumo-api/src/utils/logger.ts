import expressWinston from "express-winston";
import winston, { format } from "winston";
import "winston-mongodb";
import { config } from "../configs";

export default class WinstonLogger {
  warningLogger = () => {
    if (process.env.NODE_ENV === "test") {
      return expressWinston.logger({
        transports: [
          new winston.transports.File({
            level: "error",
            filename: "error.test.log",
          }),
        ],
        format: winston.format.combine(format.timestamp(), format.errors()),
      }); // dummy logger
    }
    return expressWinston.logger({
      transports: [
        new winston.transports.MongoDB({
          level: "warn",
          db: config.MONGDB.SERVER_URI,
          collection: "logs",
        }),
      ],
      format: winston.format.combine(
        format.json(),
        format.timestamp(),
        format.metadata(),
        format.errors(),
        format.prettyPrint()
      ),
      statusLevels: true,
    });
  };
  errorLogger = () => {
    if (process.env.NODE_ENV === "test") {
      return expressWinston.logger({
        transports: [
          new winston.transports.File({
            level: "error",
            filename: "error.test.log",
          }),
        ],
        format: winston.format.combine(format.timestamp(), format.errors()),
      }); // dummy logger
    }
    return expressWinston.errorLogger({
      transports: [
        new winston.transports.Console(),
        // new winston.transports.MongoDB({
        //   level: "error",
        //   db: config.MONGDB.SERVER_URI,
        //   collection: "logs",
        // }),
      ],
      format: winston.format.combine(
        format.json(),
        format.timestamp(),
        format.metadata(),
        format.errors(),
        format.prettyPrint()
      ),
    });
  };
}
