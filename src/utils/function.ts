import crypto from "crypto";
import fs from "fs";
import path from "path";
import { URL } from "url";
import type { RSSData } from "../types.js";
import { resolveProjectFile } from "./paths.js";

export function getDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function truncateDiscord(str: string, limit = 2000): string {
  if (str.length <= limit) return str;

  let cut = str.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > 0) cut = cut.slice(0, lastSpace);

  return cut + "...";
}

const rssPath = resolveProjectFile("rss.json");

export let rssData: RSSData = { feeds: [] };

try {
  rssData = JSON.parse(fs.readFileSync(rssPath, "utf8")) as RSSData;
} catch {
  console.log(
    "⚠️ rss.json does not exist; it will be created on the first registration.",
  );
}

export function saveRSS(): void {
  fs.writeFileSync(rssPath, JSON.stringify(rssData, null, 2));
}

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function toBase62(buffer: Buffer): string {
  let num = BigInt("0x" + buffer.toString("hex"));
  let out = "";
  while (num > 0) {
    out = BASE62[Number(num % 62n)] + out;
    num /= 62n;
  }
  return out || "0";
}

let lastTimestamp = 0;
let counter = 0;

export async function generateUltimateHash(
  length: number,
  ...extraParams: string[]
): Promise<string> {
  if (!length || length < 4) {
    throw new Error("The length must be >= 4.");
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
