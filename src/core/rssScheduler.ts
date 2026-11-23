import cron, { type ScheduledTask } from "node-cron";
import { config } from "../config.js";
import {
  checkDefaultFeeds,
  checkIntervalFeeds,
} from "../rss/rssManager.js";
import { sendDigest } from "../rss/digest.js";

let defaultTask: ScheduledTask | null = null;
let intervalTask: ScheduledTask | null = null;
let digestTask: ScheduledTask | null = null;

export function startRssScheduler(): void {
  if (defaultTask) return;
  defaultTask = cron.schedule(config.rssFetchCron, checkDefaultFeeds);
  intervalTask = cron.schedule("* * * * *", checkIntervalFeeds);
  digestTask = cron.schedule(config.digestCron, async () => {
    await sendDigest();
  });
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
  if (digestTask) {
    digestTask.stop();
    digestTask = null;
  }
}
