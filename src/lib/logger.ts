import pino from "pino";
import path from "path";
import fs from "fs";

const isDev = process.env.NODE_ENV !== "production";

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const transport = pino.transport(
  isDev
    ? {
        targets: [
          {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" },
            level: "debug",
          },
          {
            target: "pino/file",
            options: { destination: path.join(logsDir, "app.log"), mkdir: true },
            level: "info",
          },
        ],
      }
    : {
        targets: [
          {
            target: "pino/file",
            options: { destination: 1 },
            level: "info",
          },
          {
            target: "pino/file",
            options: { destination: path.join(logsDir, "app.log"), mkdir: true },
            level: "info",
          },
          {
            target: "pino/file",
            options: { destination: path.join(logsDir, "error.log"), mkdir: true },
            level: "error",
          },
        ],
      }
);

export const logger = pino(
  {
    level: isDev ? "debug" : "info",
    base: { service: "monitoring-kerja-sg" },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);
