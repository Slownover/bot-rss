import {
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ContainerBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type { Command, Feed } from "../types.js";
import { getDomain } from "../utils/function.js";
import { t } from "../i18n.js";

const PAGE_SIZE = 5;
const COLLECTOR_TIME = 60_000;
const FALLBACK_ICON =
  "https://cdn.discordapp.com/emojis/616026019455041546.webp?animated=false&size=128";

function feedIcon(feed: Feed, showFull: boolean): string {
  if (feed.sensitive && !showFull) return FALLBACK_ICON;
  const site = feed.site ?? getDomain(feed.url);
  if (!site) return FALLBACK_ICON;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(site)}&sz=64`;
}

function buildEntry(
  f: Feed,
  showFull: boolean,
  interaction: ChatInputCommandInteraction,
): { content: string; iconUrl: string } {
  const url = showFull
    ? `\`${f.url}\``
    : f.sensitive
      ? `\`${getDomain(f.url) ?? "unknown"}/...\``
      : `\`${f.url}\``;

  const badges: string[] = [];
  if (f.enabled === false) badges.push(t("cmd.list.paused"));
  if (f.intervalMinutes) {
    badges.push(t("cmd.list.customInterval", { min: f.intervalMinutes }));
  }
  if (f.roleId) {
    const role = interaction.guild?.roles.cache.get(f.roleId);
    badges.push(t("cmd.list.role", { role: role?.name ?? f.roleId }));
  }
  if (f.whitelist?.length || f.blacklist?.length) {
    badges.push(t("cmd.list.filtered"));
  }
  if (f.translate) badges.push(t("cmd.list.translated"));

  const suffix = badges.length ? ` — ${badges.join(" ")}` : "";
  return {
    content: `**\`${f.id}\`**: ${url}\n → <#${f.channel}>${suffix}`,
    iconUrl: feedIcon(f, showFull),
  };
}

function buildContainer(
  entries: { content: string; iconUrl: string }[],
  title: string,
  page: number,
  pageCount: number,
  disabledPrev: boolean,
  disabledNext: boolean,
): ContainerBuilder {
  const container = new ContainerBuilder();

  container.addTextDisplayComponents((td) =>
    td.setContent(title || "## RSS List"),
  );

  for (const entry of entries) {
    container.addSeparatorComponents((s) => s);
    container.addSectionComponents({
      type: ComponentType.Section,
      components: [
        {
          type: ComponentType.TextDisplay,
          content: entry.content,
        },
      ],
      accessory: {
        type: ComponentType.Thumbnail,
        media: { url: entry.iconUrl },
      },
    });
  }

  container.addSeparatorComponents((s) => s);

  container.addTextDisplayComponents((td) =>
    td.setContent(t("cmd.list.pageInfo", { page: page + 1, total: pageCount })),
  );

  container.addActionRowComponents((row) =>
    row.addComponents(
      new ButtonBuilder()
        .setCustomId("rss-list-prev")
        .setLabel("◀")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabledPrev),
      new ButtonBuilder()
        .setCustomId("rss-list-next")
        .setLabel("▶")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabledNext),
    ),
  );

  return container;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-list")
    .setDescription(t("cmd.list.description"))
    .addBooleanOption((opt) =>
      opt.setName("full").setDescription(t("cmd.list.full")).setRequired(false),
    ),

  async execute(interaction, rssData) {
    if (rssData.feeds.length === 0) {
      await interaction.reply(t("cmd.list.empty"));
      return;
    }

    const showFull = interaction.options.getBoolean("full") ?? false;

    let title = "";
    let ephemeral = false;

    if (showFull) {
      const allowed = interaction.memberPermissions?.has(
        PermissionFlagsBits.ManageMessages,
      );

      if (!allowed) {
        await interaction.reply({
          content: t("cmd.list.noPermission"),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      title = t("cmd.list.fullTitle");
      ephemeral = true;
    }

    const entries = rssData.feeds.map((f) =>
      buildEntry(f, showFull, interaction),
    );

    const pages: { content: string; iconUrl: string }[][] = [];
    for (let i = 0; i < entries.length; i += PAGE_SIZE) {
      pages.push(entries.slice(i, i + PAGE_SIZE));
    }

    const flags = ephemeral
      ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      : MessageFlags.IsComponentsV2;

    const singlePage = pages.length === 1;

    let page = 0;
    const message = await interaction.reply({
      components: [
        buildContainer(
          pages[page],
          title,
          page,
          pages.length,
          singlePage,
          singlePage,
        ),
      ],
      flags,
      fetchReply: true,
    });

    if (singlePage) return;

    const collector = message.createMessageComponentCollector({
      filter: (i) =>
        i.isButton() &&
        (i.customId === "rss-list-prev" || i.customId === "rss-list-next") &&
        i.user.id === interaction.user.id,
      time: COLLECTOR_TIME,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "rss-list-prev" && page > 0) page--;
      if (i.customId === "rss-list-next" && page < pages.length - 1) page++;

      await i.update({
        components: [
          buildContainer(
            pages[page],
            title,
            page,
            pages.length,
            page === 0,
            page >= pages.length - 1,
          ),
        ],
      });
    });

    collector.on("end", async () => {
      try {
        await interaction.editReply({
          components: [
            buildContainer(pages[page], title, page, pages.length, true, true),
          ],
        });
      } catch {
        // Message may have been deleted; nothing to do.
      }
    });
  },
};

export = command;
