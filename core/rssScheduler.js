const { checkAllFeeds } = require("../rss/rssManager.js");
const config = require("../config.json");
const cron = require("node-cron");

function startRssScheduler() {
  cron.schedule(config.rssFetchCron, checkAllFeeds);
}

module.exports = { startRssScheduler };
