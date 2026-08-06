const sharp = require("sharp");
const cheerio = require("cheerio");
const { URL } = require("url");
const { http } = require("../utils/http.js");

async function convertIcoToPng(buffer) {
  try {
    return await sharp(buffer, { failOn: "none" }).png().toBuffer();
  } catch {
    return null;
  }
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
    if (/\.ico($|\?)/i.test(iconUrl)) continue;

    try {
      const res = await http.get(iconUrl, { responseType: "arraybuffer" });
      if (res.headers["content-type"]?.includes("image")) {
        const png = await convertIcoToPng(Buffer.from(res.data));
        if (png) return png;
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
      const png = await convertIcoToPng(Buffer.from(res.data));
      if (png) return png;
    }
  } catch {}

  return null;
}

module.exports = { getSiteIcon };
