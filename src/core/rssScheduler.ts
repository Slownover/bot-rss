import cron from "node-cron";
import { config } from "../config.js";
import { checkAllFeeds } from "../rss/rssManager.js";

export function startRssScheduler(): void {
  cron.schedule(config.rssFetchCron, checkAllFeeds);
}
