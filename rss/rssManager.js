const Parser = require("rss-parser");
const translate = require("../translate.js");
const config = require("../config.json");
const { getSiteIcon } = require("./favicon.js");
const { client } = require("../core/client.js");
const {
  getDomain,
  truncateDiscord,
  rssData,
  saveRSS,
} = require("../utils/function.js");
const {
  Client,
  GatewayIntentBits,
  Collection,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  ComponentType,
  MessageFlags,
} = require("discord.js");

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
    ],
  },
});

async function checkFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    const latest = parsed.items[0];
    if (!latest) return;

    if (!feed.last) {
      feed.last = latest.link;
      saveRSS();
      return;
    }

    if (latest.link !== feed.last) {
      feed.last = latest.link;
      saveRSS();

      const titleFR = await translate(latest.title, config.targetLanguage);
      const descFR = truncateDiscord(
        await translate(
          latest.contentSnippet || latest.content || "",
          config.targetLanguage,
        ),
        1950,
      );

      const channel = client.channels.cache.get(feed.channel);

      // Main image
      let illustration =
        latest?.enclosure?.url ?? latest.mediaContent?.[0].$.url;
      let attachmentFile = null;

      // No image → favicon
      if (!illustration) {
        const domain = getDomain(latest.link);
        const faviconBuffer = await getSiteIcon(domain);

        if (faviconBuffer) {
          attachmentFile = {
            attachment: faviconBuffer,
            name: "favicon.png",
          };

          illustration = "attachment://favicon.png";
        }
      }

      // Last Fallback
      if (!illustration) {
        illustration =
          "https://cdn.discordapp.com/emojis/616026019455041546.webp?animated=false&size=128";
      }

      const messagePayload = {
        components: [
          new ContainerBuilder()
            .addSectionComponents({
              components: [
                {
                  type: ComponentType.TextDisplay,
                  content: `## [${titleFR}](${latest.link})\n**${latest.creator ?? getDomain(latest.link)}**`,
                },
              ],
              accessory: {
                type: ComponentType.Thumbnail,
                spoiler: false,
                media: { url: illustration },
              },
            })
            .addSeparatorComponents((s) => s)
            .addTextDisplayComponents((t) =>
              t.setContent(descFR ?? "Aucune description disponible"),
            )
            .addSeparatorComponents((s) => s)
            .addActionRowComponents((row) =>
              row.addComponents(
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Link)
                  .setLabel("Voir")
                  .setURL(latest.link),
              ),
            ),
        ],
        flags: MessageFlags.IsComponentsV2,
      };

      // Add file if favicon is used
      if (attachmentFile) {
        messagePayload.files = [attachmentFile];
      }

      if (channel) channel.send(messagePayload);
    }
  } catch (err) {
    console.error(`Erreur RSS (${feed.url}) :`, err);
  }
}

async function checkAllFeeds() {
  for (const feed of rssData.feeds) {
    await checkFeed(feed);
  }
}

module.exports = { checkFeed, checkAllFeeds };
