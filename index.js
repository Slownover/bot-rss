const { client } = require("./core/client");
const { startRssScheduler } = require("./core/rssScheduler");
const config = require("./config.json");

(async () => {
  startRssScheduler();
  await client.login(config.token);
})();
