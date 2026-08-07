import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command, Feed } from "../types.js";
import { getDomain } from "../utils/function.js";
import { t } from "../i18n.js";

const PAGE_SIZE = 10;
const COLLECTOR_TIME = 60_000;

function buildButtons(page: number, pageCount: number): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("rss-list-prev")
      .setLabel("◀")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId("rss-list-next")
      .setLabel("▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= pageCount - 1),
  );
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-list")
    .setDescription(t("cmd.list.description"))
    .addBooleanOption((opt) =>
      opt
        .setName("full")
        .setDescription(t("cmd.list.full"))
        .setRequired(false),
    ),

  async execute(interaction, rssData) {
    if (rssData.feeds.length === 0) {
      await interaction.reply(t("cmd.list.empty"));
      return;
    }

    const showFull = interaction.options.getBoolean("full") ?? false;

    let title: string;
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
    } else {
      title = "";
      ephemeral = false;
    }

    const buildEntry = (f: Feed): string => {
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
      return `**\`${f.id}\`**: ${url} → <#${f.channel}>${suffix}`;
    };

    const entries = rssData.feeds.map(buildEntry);

    const pages: string[] = [];
    for (let i = 0; i < entries.length; i += PAGE_SIZE) {
      pages.push(entries.slice(i, i + PAGE_SIZE).join("\n"));
    }

    const buildContent = (page: number): string => {
      const header = title ? `${title}\n` : "";
      const pageInfo = `\n${t("cmd.list.pageInfo", {
        page: page + 1,
        total: pages.length,
      })}`;
      return `${header}${pages[page]}${pageInfo}`;
    };

    if (pages.length === 1) {
      await interaction.reply({
        content: buildContent(0),
        flags: ephemeral ? MessageFlags.Ephemeral : undefined,
      });
      return;
    }

    let page = 0;
    const message = await interaction.reply({
      content: buildContent(page),
      components: [buildButtons(page, pages.length)],
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
      fetchReply: true,
    });

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
        content: buildContent(page),
        components: [buildButtons(page, pages.length)],
      });
    });

    collector.on("end", async () => {
      const disabled = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("rss-list-prev")
          .setLabel("◀")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("rss-list-next")
          .setLabel("▶")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
      );
      try {
        await interaction.editReply({
          content: buildContent(page),
          components: [disabled],
        });
      } catch {
        // Message may have been deleted; nothing to do.
      }
    });
  },
};

export = command;
