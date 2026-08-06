import sharp from "sharp";
import * as cheerio from "cheerio";
import { URL } from "url";
import { http } from "../utils/http.js";

async function convertIcoToPng(buffer: Buffer): Promise<Buffer | null> {
  try {
    return await sharp(buffer, { failOn: "none" }).png().toBuffer();
  } catch {
    return null;
  }
}

export async function getSiteIcon(domain: string): Promise<Buffer | null> {
  const baseUrl = `https://${domain}`;

  let html: string;
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
      const contentType = res.headers["content-type"];
      if (typeof contentType === "string" && contentType.includes("image")) {
        const png = await convertIcoToPng(Buffer.from(res.data));
        if (png) return png;
      }
    } catch {}
  }

  return getFavicon(domain);
}

async function getFavicon(domain: string): Promise<Buffer | null> {
  const url = `https://${domain}/favicon.ico`;

  try {
    const res = await http.get(url, { responseType: "arraybuffer" });
    const contentType = res.headers["content-type"];
    if (typeof contentType === "string" && contentType.includes("image")) {
      const png = await convertIcoToPng(Buffer.from(res.data));
      if (png) return png;
    }
  } catch {}

  return null;
}
