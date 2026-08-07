import cron, { type ScheduledTask } from "node-cron";
import { config } from "../config.js";
import { checkAllFeeds } from "../rss/rssManager.js";

let task: ScheduledTask | null = null;

export function startRssScheduler(): void {
  if (task) return;
  task = cron.schedule(config.rssFetchCron, checkAllFeeds);
}

export function stopRssScheduler(): void {
  if (task) {
    task.stop();
    task = null;
  }
}
