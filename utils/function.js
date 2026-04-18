const { URL } = require("url");
const fs = require("fs");
const path = require("path");

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function truncateDiscord(str, limit = 2000) {
  if (str.length <= limit) return str;

  let cut = str.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > 0) cut = cut.slice(0, lastSpace);

  return cut + "...";
}

let rssData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../rss.json"), "utf8"),
);
function saveRSS() {
  fs.writeFileSync(
    path.join(__dirname, "../rss.json"),
    JSON.stringify(rssData, null, 2),
  );
}

module.exports = { getDomain, truncateDiscord, rssData, saveRSS };
