import expressWinston from "express-winston";
import winston, { format } from "winston";
import "winston-mongodb";
import { config } from "../configs";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class OperationLogger {
  static async log({
    entity_type,
    entity_ids,
    action,
    performed_by,
    ip_address,
    changes,
    description,
  }: {
    entity_type: string;
    entity_ids: string;
    action: string;
    performed_by: string;
    ip_address?: string;
    changes?: any;
    description?: string;
  }) {
    return prisma.operationLog.create({
      data: {
        entity_type,
        entity_ids,
        action,
        performed_by,
        ip_address,
        changes,
        description,
      },
    });
  }
}

export default class WinstonLogger {
  warningLogger = () => {
    if (config.NODE_ENV === "test") {
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
          db: config.LOG_DATABASE.URL,
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
    if (config.NODE_ENV === "test") {
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
