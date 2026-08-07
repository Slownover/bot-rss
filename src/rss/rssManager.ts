import Parser from "rss-parser";
import {
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ContainerBuilder,
  MessageFlags,
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
import type { Feed } from "../types.js";

type CustomItem = {
  mediaContent?: { $: { url?: string } }[];
  mediaThumbnail?: { $: { url?: string } }[];
};

const parser = new Parser<Record<string, unknown>, CustomItem>({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
    ],
  },
});

async function parseFeedWithRetry(
  url: string,
  retries = 3,
): Promise<Parser.Output<CustomItem>> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await parser.parseURL(url);
    } catch (err) {
      lastErr = err;
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }
  }
  throw lastErr;
}

export async function checkFeed(feed: Feed): Promise<void> {
  try {
    const parsed = await parseFeedWithRetry(feed.url);
    const latest = parsed.items[0];
    const link = latest?.link;
    if (!link) return;

    if (!feed.last || rssData.feeds.some((f) => f.last === link)) {
      feed.last = link;
      saveRSS();
      return;
    }

    if (link !== feed.last) {
      feed.last = link;
      saveRSS();

      const shouldTranslate = feed.translate !== false;

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
      } = {
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

      await channel.send(messagePayload);
      logger.info(t("log.feedAdded", { title }));
    }
  } catch (err) {
    logger.error({ err }, t("log.rssError", { url: feed.url }));
  }
}

const CONCURRENCY = 5;

export async function checkAllFeeds(): Promise<void> {
  const feeds = rssData.feeds;
  logger.info(t("log.rssCheckStart", { count: feeds.length }));
  await mapLimit(feeds, CONCURRENCY, (feed) => checkFeed(feed));
  logger.info(t("log.rssCheckDone"));
}
