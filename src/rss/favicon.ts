import sharp from "sharp";
import * as cheerio from "cheerio";
import { URL } from "url";
import { http } from "../utils/http.js";

const CACHE_TTL_MS = 60 * 60 * 1000;
const NEGATIVE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_SIZE = 200;

const cache = new Map<string, { buffer: Buffer | null; expires: number }>();

function prune(): void {
  if (cache.size <= MAX_CACHE_SIZE) return;
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expires <= now) cache.delete(key);
  }
  if (cache.size > MAX_CACHE_SIZE) {
    const sorted = [...cache.entries()].sort(
      (a, b) => a[1].expires - b[1].expires,
    );
    for (const [key] of sorted.slice(0, cache.size - MAX_CACHE_SIZE)) {
      cache.delete(key);
    }
  }
}

async function convertIcoToPng(buffer: Buffer): Promise<Buffer | null> {
  try {
    return await sharp(buffer, { failOn: "none" }).png().toBuffer();
  } catch {
    return null;
  }
}

async function fetchSiteIcon(domain: string): Promise<Buffer | null> {
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

export async function getSiteIcon(domain: string): Promise<Buffer | null> {
  const now = Date.now();
  const hit = cache.get(domain);
  if (hit && hit.expires > now) return hit.buffer;

  const buffer = await fetchSiteIcon(domain);
  cache.set(domain, {
    buffer,
    expires: now + (buffer ? CACHE_TTL_MS : NEGATIVE_TTL_MS),
  });
  prune();
  return buffer;
}
