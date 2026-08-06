import { client } from "./core/client";
import { startRssScheduler } from "./core/rssScheduler";
import { config } from "./config";

(async () => {
  startRssScheduler();
  await client.login(config.token);
})();
