const { checkAllFeeds } = require("../rss/rssManager.js");
const config = require("../config.json");

function startRssScheduler() {
  setInterval(checkAllFeeds, config.rssFetchIntervalMs);
}

module.exports = { startRssScheduler };
