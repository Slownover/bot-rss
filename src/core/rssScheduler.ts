import cron, { type ScheduledTask } from "node-cron";
import { config } from "../config.js";
import {
  checkDefaultFeeds,
  checkIntervalFeeds,
} from "../rss/rssManager.js";

let defaultTask: ScheduledTask | null = null;
let intervalTask: ScheduledTask | null = null;

export function startRssScheduler(): void {
  if (defaultTask) return;
  defaultTask = cron.schedule(config.rssFetchCron, checkDefaultFeeds);
  intervalTask = cron.schedule("* * * * *", checkIntervalFeeds);
}

export function stopRssScheduler(): void {
  if (defaultTask) {
    defaultTask.stop();
    defaultTask = null;
  }
  if (intervalTask) {
    intervalTask.stop();
    intervalTask = null;
  }
}
