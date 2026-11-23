import { ContainerBuilder, MessageFlags } from "discord.js";
import { client } from "../core/client.js";
import { config } from "../config.js";
import { t } from "../i18n.js";
import type { DigestEntry, Feed } from "../types.js";
import { getDomain, rssData, saveRSS } from "../utils/function.js";
import { logger } from "../utils/logger.js";

/** Components v2 caps the total text of a message at 4000 characters. */
const MAX_TEXT_PER_MESSAGE = 3800;
/** Oldest entries are dropped beyond this, e.g. if a channel stays unreachable. */
const MAX_QUEUE = 500;
const MAX_TITLE = 200;

let running = false;

export function enqueueDigest(
  feed: Feed,
  title: string,
  link: string,
  score: number,
): void {
  rssData.digest.push({
    feedId: feed.id,
    channel: config.digestChannelId ?? feed.channel,
    title,
    link,
    site: getDomain(link) ?? feed.site ?? "",
    score,
    addedAt: new Date().toISOString(),
  });
  if (rssData.digest.length > MAX_QUEUE) {
    rssData.digest.splice(0, rssData.digest.length - MAX_QUEUE);
  }
}

function escapeTitle(title: string): string {
  const clean = title.replace(/[[\]]/g, "").replace(/\s+/g, " ").trim();
  return clean.length > MAX_TITLE ? `${clean.slice(0, MAX_TITLE)}…` : clean;
}

/** Builds the digest body, grouped by site and sorted by score. */
function buildLines(entries: DigestEntry[]): string[] {
  const bySite = new Map<string, DigestEntry[]>();
  for (const entry of entries) {
    const site = entry.site || "—";
    const list = bySite.get(site) ?? [];
    list.push(entry);
    bySite.set(site, list);
  }

  const groups = [...bySite.entries()]
    .map(([site, list]) => ({
      site,
      list: list.sort((a, b) => b.score - a.score),
    }))
    .sort((a, b) => b.list[0].score - a.list[0].score);

  const lines: string[] = [];
  for (const { site, list } of groups) {
    lines.push(`### ${site}`);
    for (const entry of list) {
      lines.push(`- [${escapeTitle(entry.title)}](${entry.link})`);
    }
  }
  return lines;
}

function chunk(lines: string[]): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const line of lines) {
    if (current && current.length + line.length + 1 > MAX_TEXT_PER_MESSAGE) {
      chunks.push(current);
      current = "";
    }
    current += (current ? "\n" : "") + line.slice(0, MAX_TEXT_PER_MESSAGE);
  }
  if (current) chunks.push(current);
  return chunks;
}

async function sendToChannel(
  channelId: string,
  entries: DigestEntry[],
): Promise<boolean> {
  const channel = client.channels.cache.get(channelId);
  if (!channel?.isSendable()) {
    logger.warn(t("log.digestChannelUnavailable", { channel: channelId }));
    return false;
  }

  const chunks = chunk(buildLines(entries));
  try {
    for (let i = 0; i < chunks.length; i++) {
      const container = new ContainerBuilder();
      if (i === 0) {
        container.addTextDisplayComponents((td) =>
          td.setContent(t("rss.digestTitle", { count: entries.length })),
        );
        container.addSeparatorComponents((s) => s);
      }
      container.addTextDisplayComponents((td) => td.setContent(chunks[i]));
      await channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }
    return true;
  } catch (err) {
    logger.error({ err }, t("log.digestSendError", { channel: channelId }));
    return false;
  }
}

/**
 * Posts the pending digest, one message (or more) per channel.
 * Entries are only removed for channels where sending succeeded.
 * Returns the number of articles sent, or null if a digest is already running.
 */
export async function sendDigest(): Promise<number | null> {
  if (running) return null;
  running = true;

  try {
    const snapshot = [...rssData.digest];
    if (!snapshot.length) return 0;

    const byChannel = new Map<string, DigestEntry[]>();
    for (const entry of snapshot) {
      const list = byChannel.get(entry.channel) ?? [];
      list.push(entry);
      byChannel.set(entry.channel, list);
    }

    const delivered = new Set<DigestEntry>();
    for (const [channelId, entries] of byChannel) {
      if (await sendToChannel(channelId, entries)) {
        entries.forEach((e) => delivered.add(e));
      }
    }

    if (delivered.size) {
      rssData.digest = rssData.digest.filter((e) => !delivered.has(e));
      saveRSS();
      logger.info(t("log.digestSent", { count: delivered.size }));
    }
    return delivered.size;
  } catch (err) {
    logger.error({ err }, t("log.digestSendError", { channel: "*" }));
    return 0;
  } finally {
    running = false;
  }
}
