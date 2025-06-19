import expressWinston from "express-winston";
import winston, { format } from "winston";
import "winston-mongodb";
import { config } from "../configs";

export default class WinstonLogger {
  warningLogger = () => {
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
