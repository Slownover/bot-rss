const { URL } = require("url");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function toBase62(buffer) {
  let num = BigInt("0x" + buffer.toString("hex"));
  let out = "";
  while (num > 0) {
    out = BASE62[num % 62n] + out;
    num /= 62n;
  }
  return out || "0";
}

let lastTimestamp = 0;
let counter = 0;

async function generateUltimateHash(length, ...extraParams) {
  if (!length || length < 4) {
    throw new Error("La longueur doit être >= 4.");
  }

  const now = Date.now();
  if (now === lastTimestamp) {
    counter++;
  } else {
    counter = 0;
    lastTimestamp = now;
  }

  const date = new Date(now)
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 17);

  const extra = extraParams.length ? extraParams.join("_") : "";

  const randomBytes = crypto.randomBytes(64);

  const raw = `${date}-${extra}-${counter}-${crypto.randomUUID()}`;

  const hash = crypto
    .createHash("sha512")
    .update(raw)
    .update(randomBytes)
    .digest();

  const base62 = toBase62(hash);

  return base62.slice(0, length);
}

module.exports = {
  getDomain,
  truncateDiscord,
  rssData,
  saveRSS,
  generateUltimateHash,
};
