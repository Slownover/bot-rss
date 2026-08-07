import fs from "fs";
import path from "path";
import pino from "pino";
import { resolveProjectFile } from "./paths.js";

import "dotenv/config";

const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";
const LOG_RETENTION_DAYS = Math.max(
  1,
  Number(process.env.LOG_RETENTION_DAYS ?? 3),
);
const LOG_DIR = process.env.LOG_DIR ?? resolveProjectFile("logs");
const PRETTY =
  process.env.LOG_PRETTY === "true" || Boolean(process.stdout.isTTY);

fs.mkdirSync(LOG_DIR, { recursive: true });

const targets: pino.TransportTargetOptions[] = [];

if (PRETTY) {
  targets.push({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
    },
    level: LOG_LEVEL,
  });
} else {
  targets.push({
    target: "pino/file",
    options: { destination: 1 },
    level: LOG_LEVEL,
  });
}

targets.push({
  target: "pino-roll",
  options: {
    file: path.join(LOG_DIR, "rss.log"),
    frequency: "daily",
    dateFormat: "yyyy-MM-dd",
    mkdir: true,
    limit: {
      count: Math.max(1, LOG_RETENTION_DAYS - 1),
      removeOtherLogFiles: true,
    },
  },
  level: "trace",
});

export const logger = pino(
  {
    level: LOG_LEVEL,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.transport({ targets }),
);
