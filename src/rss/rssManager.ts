import {
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ContainerBuilder,
  MessageFlags,
  WebhookClient,
} from "discord.js";
import { config } from "../config.js";
import { translate } from "../translate.js";
import { client } from "../core/client.js";
import {
  getDomain,
  rssData,
  saveRSS,
  truncateDiscord,
} from "../utils/function.js";
import { mapLimit } from "../utils/concurrency.js";
import { logger } from "../utils/logger.js";
import { t } from "../i18n.js";
import { getSiteIcon } from "./favicon.js";
import {
  parseFeedWithRetry,
  type CustomItem,
  type ParsedFeed,
} from "./feedFetcher.js";
import type { Feed } from "../types.js";

const CONCURRENCY = 5;
const MAX_SENT_HISTORY = 500;

const alertedFeeds = new Set<string>();

function isFiltered(
  feed: Feed,
  title: string | undefined,
  description: string | undefined,
): boolean {
  const text = `${title ?? ""}\n${description ?? ""}`.toLowerCase();

  if (feed.blacklist?.length) {
    for (const kw of feed.blacklist) {
      if (text.includes(kw.trim().toLowerCase())) return true;
    }
  }

  if (feed.whitelist?.length) {
    const keywords = feed.whitelist
      .map((kw) => kw.trim().toLowerCase())
      .filter(Boolean);
    if (keywords.length && !keywords.some((kw) => text.includes(kw))) {
      return true;
    }
  }

  return false;
}

function recordPosted(link: string): void {
  rssData.sent.push(link);
  if (rssData.sent.length > MAX_SENT_HISTORY) {
    rssData.sent.splice(0, rssData.sent.length - MAX_SENT_HISTORY);
  }
  rssData.stats.postedCount += 1;
  rssData.stats.lastPostAt = new Date().toISOString();
}

async function sendAdminAlert(message: string): Promise<void> {
  if (!config.adminChannelId) return;
  const channel = client.channels.cache.get(config.adminChannelId);
  if (!channel?.isSendable()) return;
  try {
    await channel.send(message);
  } catch (err) {
    logger.error({ err }, t("log.adminAlertError"));
  }
}

async function postToWebhook(feed: Feed, content: string): Promise<void> {
  if (!feed.webhookUrl) return;
  try {
    const webhook = new WebhookClient({ url: feed.webhookUrl });
    await webhook.send({ content: truncateDiscardContent(content) });
  } catch (err) {
    logger.error({ err }, t("log.webhookError"));
  }
}

function truncateDiscardContent(content: string): string {
  const MAX_WEBHOOK_CONTENT = 1900;
  if (content.length <= MAX_WEBHOOK_CONTENT) return content;
  return truncateDiscord(content, MAX_WEBHOOK_CONTENT);
}

function advanceLast(feed: Feed, link: string): void {
  if (feed.last === link) return;
  feed.last = link;
  saveRSS();
}

function registerFailure(feed: Feed, err: unknown): void {
  feed.errorCount = (feed.errorCount ?? 0) + 1;
  saveRSS();
  logger.error({ err }, t("log.rssError", { url: feed.url }));

  const max = config.maxFeedFailures ?? 5;
  if (feed.errorCount >= max && !alertedFeeds.has(feed.id)) {
    alertedFeeds.add(feed.id);
    const message = t("rss.feedErrorAlert", {
      url: feed.url,
      count: feed.errorCount,
    });
    void sendAdminAlert(message);
    logger.warn(t("log.feedErrorAlert", { url: feed.url, count: feed.errorCount }));
  }
}

function handleRecovery(feed: Feed): void {
  if (!feed.errorCount) return;
  const wasAlerted = alertedFeeds.has(feed.id);
  feed.errorCount = 0;
  saveRSS();
  if (wasAlerted) {
    alertedFeeds.delete(feed.id);
    const message = t("rss.feedRecovered", { url: feed.url });
    void sendAdminAlert(message);
    logger.info(t("log.feedRecovered", { url: feed.url }));
  }
}

function recordSite(feed: Feed, parsed: ParsedFeed): void {
  const site = getDomain(parsed.link) ?? getDomain(feed.url);
  if (site && feed.site !== site) {
    feed.site = site;
    saveRSS();
  }
}

export async function checkFeed(feed: Feed): Promise<void> {
  if (feed.enabled === false) {
    logger.debug(t("log.feedPaused", { url: feed.url }));
    return;
  }

  let parsed: ParsedFeed;
  try {
    parsed = await parseFeedWithRetry(feed.url);
  } catch (err) {
    registerFailure(feed, err);
    return;
  }

  handleRecovery(feed);
  recordSite(feed, parsed);

  const latest = parsed.items[0];
  const link = latest?.link;
  if (!link) return;

  const known =
    feed.last === link ||
    rssData.sent.includes(link) ||
    rssData.feeds.some((f) => f.last === link);

  if (known) {
    advanceLast(feed, link);
    return;
  }

  if (
    isFiltered(
      feed,
      latest.title,
      latest.contentSnippet ?? latest.content,
    )
  ) {
    advanceLast(feed, link);
    logger.info(t("log.feedSkipped", { title: latest.title ?? link }));
    return;
  }

  feed.last = link;
  saveRSS();

  const shouldTranslate = feed.translate === true;

  const title = shouldTranslate
    ? (await translate(latest.title, config.targetLanguage)) ||
      getDomain(link) ||
      t("rss.noTitle")
    : latest.title || getDomain(link) || t("rss.noTitle");

  const description = truncateDiscord(
    shouldTranslate
      ? await translate(
          latest.contentSnippet || latest.content,
          config.targetLanguage,
        )
      : (latest.contentSnippet || latest.content) ?? "",
    1950,
  );

  const channel = client.channels.cache.get(feed.channel);
  if (!channel?.isSendable()) return;

  let illustration =
    latest?.enclosure?.url ??
    latest.mediaThumbnail?.[0].$.url ??
    latest.mediaContent?.[0].$.url;
  let attachmentFile: { attachment: Buffer; name: string } | null = null;

  if (!illustration) {
    const domain = getDomain(link);
    if (domain) {
      const faviconBuffer = await getSiteIcon(domain);

      if (faviconBuffer) {
        attachmentFile = {
          attachment: faviconBuffer,
          name: "favicon.png",
        };

        illustration = "attachment://favicon.png";
      }
    }
  }

  if (!illustration) {
    illustration =
      "https://cdn.discordapp.com/emojis/616026019455041546.webp?animated=false&size=128";
  }

  const messagePayload: {
    components: ContainerBuilder[];
    files?: { attachment: Buffer; name: string }[];
    flags: number;
    content?: string;
  } = {
    content: feed.roleId ? `<@&${feed.roleId}>` : undefined,
    components: [
      new ContainerBuilder()
        .addSectionComponents({
          type: ComponentType.Section,
          components: [
            {
              type: ComponentType.TextDisplay,
              content: `## [${title}](${link})\n**${latest.creator ?? getDomain(link)}**`,
            },
          ],
          accessory: {
            type: ComponentType.Thumbnail,
            spoiler: false,
            media: { url: illustration },
          },
        })
        .addSeparatorComponents((s) => s)
        .addTextDisplayComponents((tDisplay) =>
          tDisplay.setContent(description || t("rss.noDescription")),
        )
        .addSeparatorComponents((s) => s)
        .addActionRowComponents((row) =>
          row.addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setLabel(t("rss.openLink"))
              .setURL(link),
          ),
        ),
    ],
    flags: MessageFlags.IsComponentsV2,
  };

  if (attachmentFile) {
    messagePayload.files = [attachmentFile];
  }

  try {
    await channel.send(messagePayload);
  } catch (err) {
    logger.error({ err }, t("log.rssError", { url: feed.url }));
    return;
  }

  await postToWebhook(
    feed,
    `## [${title}](${link})\n${description || t("rss.noDescription")}`,
  );

  recordPosted(link);
  saveRSS();
  logger.info(t("log.feedAdded", { title }));
}

export async function checkDefaultFeeds(): Promise<void> {
  const feeds = rssData.feeds.filter((f) => f.intervalMinutes === undefined);
  if (!feeds.length) return;
  logger.info(t("log.rssCheckStart", { count: feeds.length }));
  await mapLimit(feeds, CONCURRENCY, (feed) => checkFeed(feed));
  logger.info(t("log.rssCheckDone"));
}

export async function checkIntervalFeeds(): Promise<void> {
  const now = Date.now();
  const due = rssData.feeds.filter(
    (f) =>
      f.intervalMinutes !== undefined &&
      f.enabled !== false &&
      (f.lastCheckedAt ?? 0) + f.intervalMinutes * 60_000 <= now,
  );
  if (!due.length) return;

  await mapLimit(due, CONCURRENCY, (feed) => {
    feed.lastCheckedAt = now;
    return checkFeed(feed);
  });
}
