import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../types.js";
import { generateUltimateHash } from "../utils/function.js";
import { fetchLatestItem } from "../rss/feedFetcher.js";
import { t } from "../i18n.js";
import { logger } from "../utils/logger.js";

const WEBHOOK_RE = /^https:\/\/(?:discord|discordapp)\.com\/api\/webhooks\//i;
const CONFIRM_TIMEOUT = 60_000;

function parseKeywords(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-add")
    .setDescription(t("cmd.add.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) =>
      opt
        .setName("url")
        .setDescription(t("cmd.add.url"))
        .setRequired(true),
    )
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription(t("cmd.add.channel"))
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("sensitive")
        .setDescription(t("cmd.add.sensitive"))
        .setRequired(false),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("translate")
        .setDescription(t("cmd.add.translate"))
        .setRequired(false),
    )
    .addRoleOption((opt) =>
      opt
        .setName("role")
        .setDescription(t("cmd.add.role"))
        .setRequired(false),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("interval")
        .setDescription(t("cmd.add.interval"))
        .setMinValue(1)
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt
        .setName("whitelist")
        .setDescription(t("cmd.add.whitelist"))
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt
        .setName("blacklist")
        .setDescription(t("cmd.add.blacklist"))
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt
        .setName("webhook")
        .setDescription(t("cmd.add.webhook"))
        .setRequired(false),
    ),

  async execute(interaction, rssData, saveRSS) {
    const url = interaction.options.getString("url", true);
    const channel = interaction.options.getChannel("channel", true);
    const sensitive = interaction.options.getBoolean("sensitive") ?? false;
    const translate = interaction.options.getBoolean("translate") ?? false;
    const role = interaction.options.getRole("role");
    const interval = interaction.options.getInteger("interval");
    const whitelist = parseKeywords(interaction.options.getString("whitelist"));
    const blacklist = parseKeywords(interaction.options.getString("blacklist"));
    const webhook = interaction.options.getString("webhook");

    if (webhook && !WEBHOOK_RE.test(webhook)) {
      await interaction.reply({
        content: t("cmd.add.webhookInvalid"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const preview = await fetchLatestItem(url);
    if (preview === null) {
      await interaction.reply({
        content: t("cmd.add.invalidFeed"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const previewContent = t("cmd.add.preview", {
      title: preview.title ?? t("rss.noTitle"),
      link: preview.link ?? url,
    });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("rss-add-confirm")
        .setLabel(t("cmd.add.confirm"))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("rss-add-cancel")
        .setLabel(t("cmd.add.cancel"))
        .setStyle(ButtonStyle.Danger),
    );

    const message = await interaction.reply({
      content: previewContent,
      components: [row],
      flags: MessageFlags.Ephemeral,
      fetchReply: true,
    });

    let settled = false;

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.isButton() && i.user.id === interaction.user.id,
      time: CONFIRM_TIMEOUT,
    });

    collector.on("collect", async (i) => {
      if (settled) return;
      settled = true;

      if (i.customId === "rss-add-cancel") {
        try {
          await i.update({ content: t("cmd.add.cancelled"), components: [] });
        } catch (err) {
          logger.error({ err }, t("log.commandError", { name: "rss-add" }));
        }
        collector.stop();
        return;
      }

      try {
        const id = await generateUltimateHash(8, url, channel.id);
        rssData.feeds.push({
          url,
          channel: channel.id,
          last: null,
          id,
          sensitive,
          translate,
          ...(role ? { roleId: role.id } : {}),
          ...(interval ? { intervalMinutes: interval } : {}),
          ...(whitelist.length ? { whitelist } : {}),
          ...(blacklist.length ? { blacklist } : {}),
          ...(webhook ? { webhookUrl: webhook } : {}),
        });
        saveRSS();

        let success = t("cmd.add.success", { url, channel: channel.id, id });
        if (
          role &&
          !role.mentionable &&
          !(
            interaction.guild?.members.me?.permissions.has(
              PermissionFlagsBits.MentionEveryone,
            ) ?? false
          )
        ) {
          success += `\n${t("cmd.add.roleNotMentionable")}`;
        }

        await i.update({ content: success, components: [] });
      } catch (err) {
        logger.error({ err }, t("log.commandError", { name: "rss-add" }));
        try {
          await i.update({ content: t("cmd.add.cancelled"), components: [] });
        } catch {}
      }
      collector.stop();
    });

    collector.on("end", async () => {
      if (settled) return;
      try {
        await interaction.editReply({ components: [] });
      } catch {
        // Message may have been deleted; nothing to do.
      }
    });
  },
};

export = command;
