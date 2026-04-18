const sharp = require("sharp");
const cheerio = require("cheerio");
const { URL } = require("url");
const { http } = require("../utils/http.js");

async function convertIcoToPng(buffer) {
  return sharp(buffer).png().toBuffer();
}

async function getSiteIcon(domain) {
  const baseUrl = `https://${domain}`;

  let html;
  try {
    const res = await http.get(baseUrl);
    html = res.data;
  } catch {
    return null;
  }

  const $ = cheerio.load(html);
  const links = $('link[rel*="icon"]');

  for (const el of links.toArray()) {
    const href = $(el).attr("href");
    if (!href) continue;

    const iconUrl = new URL(href, baseUrl).href;

    try {
      const res = await http.get(iconUrl, { responseType: "arraybuffer" });
      if (res.headers["content-type"]?.includes("image")) {
        return convertIcoToPng(Buffer.from(res.data));
      }
    } catch {}
  }

  return getFavicon(domain);
}

async function getFavicon(domain) {
  const url = `https://${domain}/favicon.ico`;

  try {
    const res = await http.get(url, { responseType: "arraybuffer" });
    if (res.headers["content-type"]?.includes("image")) {
      return convertIcoToPng(Buffer.from(res.data));
    }
  } catch {}

  return null;
}

module.exports = { getSiteIcon };
