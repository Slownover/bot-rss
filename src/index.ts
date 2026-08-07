import { client } from "./core/client.js";
import {
  startRssScheduler,
  stopRssScheduler,
} from "./core/rssScheduler.js";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { t } from "./i18n.js";

function shutdown(signal: NodeJS.Signals): void {
  logger.info(t("log.shutdown", { signal }));
  stopRssScheduler();
  client.destroy();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, t("log.unhandledRejection"));
});
process.on("uncaughtException", (err) => {
  logger.error({ err }, t("log.uncaughtException"));
});

(async () => {
  try {
    startRssScheduler();
    await client.login(config.token);
  } catch (err) {
    logger.error({ err }, t("log.fatalError"));
    process.exit(1);
  }
})();
