const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  ComponentType,
  MessageFlags,
} = require("discord.js");

const fs = require("fs");
const Parser = require("rss-parser");
const translateToFrench = require("./translate");
const cheerio = require("cheerio");
const sharp = require("sharp");
const { URL } = require("url");

const config = require("./config.json");
const parser = new Parser();

// Chargement RSS
let rssData = JSON.parse(fs.readFileSync("rss.json", "utf8"));
function saveRSS() {
  fs.writeFileSync("rss.json", JSON.stringify(rssData, null, 2));
}

// Client Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Chargement des commandes
client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((f) => f.endsWith(".js"));
const commandsJSON = [];

for (const file of commandFiles) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
  commandsJSON.push(cmd.data.toJSON());
}

// Enregistrement des slash commands
const rest = new REST({ version: "10" }).setToken(config.token);

async function registerCommands() {
  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commandsJSON },
  );
  console.log("✔ Commandes enregistrées");
}

// Convertit ICO → PNG (buffer)
async function convertIcoToPng(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    return await sharp(buffer).png().toBuffer();
  } catch {
    return null;
  }
}

// Récupère favicon via <link rel="icon">
async function getSiteIcon(domain) {
  const baseUrl = `https://${domain}`;

  let html;
  try {
    const res = await fetch(baseUrl);
    html = await res.text();
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
      const res = await fetch(iconUrl);
      if (res.ok && res.headers.get("content-type")?.includes("image")) {
        return await convertIcoToPng(iconUrl);
      }
    } catch {}
  }

  return getFavicon(domain);
}

// Fallback favicon.ico
async function getFavicon(domain) {
  const url = `https://${domain}/favicon.ico`;

  try {
    const res = await fetch(url);
    if (res.ok && res.headers.get("content-type")?.includes("image")) {
      return await convertIcoToPng(url);
    }
  } catch {}

  return null;
}

function truncateDiscord(str, limit = 2000) {
  if (str.length <= limit) return str;

  let cut = str.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > 0) cut = cut.slice(0, lastSpace);

  return cut + "...";
}

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// Vérification d’un flux
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

      const titleFR = await translateToFrench(latest.title);
      const descFR = truncateDiscord(
        await translateToFrench(latest.contentSnippet || latest.content || ""),
        1950,
      );

      const channel = client.channels.cache.get(feed.channel);

      // IMAGE PRINCIPALE
      let illustration = latest?.enclosure?.url;
      let attachmentFile = null;

      // Si pas d’image → favicon
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

      // Fallback final
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

      // Ajout du fichier si favicon utilisé
      if (attachmentFile) {
        messagePayload.files = [attachmentFile];
      }

      if (channel) channel.send(messagePayload);
    }
  } catch (err) {
    console.error(`Erreur RSS (${feed.url}) :`, err);
  }
}

// Vérification de tous les flux
async function checkAllFeeds() {
  for (const feed of rssData.feeds) {
    await checkFeed(feed);
  }
}

// Gestion des interactions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  await cmd.execute(interaction, rssData, saveRSS);
});

// Ready
client.once("clientReady", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
  setInterval(checkAllFeeds, 2 * 60_000);
});

// Start
(async () => {
  await registerCommands();
  await client.login(config.token);
})();
