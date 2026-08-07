import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../types.js";
import { truncateDiscord } from "../utils/function.js";
import { t } from "../i18n.js";

const WEBHOOK_RE = /^https:\/\/(?:discord|discordapp)\.com\/api\/webhooks\//i;
const OFF = "off";

function parseKeywords(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-edit")
    .setDescription(t("cmd.edit.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) =>
      opt
        .setName("id")
        .setDescription(t("cmd.edit.id"))
        .setRequired(true),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("enabled")
        .setDescription(t("cmd.edit.enable"))
        .setRequired(false),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("translate")
        .setDescription(t("cmd.edit.translate"))
        .setRequired(false),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("interval")
        .setDescription(t("cmd.edit.interval"))
        .setMinValue(0)
        .setRequired(false),
    )
    .addRoleOption((opt) =>
      opt
        .setName("role")
        .setDescription(t("cmd.edit.role"))
        .setRequired(false),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("remove_role")
        .setDescription(t("cmd.edit.removeRole"))
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt
        .setName("webhook")
        .setDescription(t("cmd.edit.webhook"))
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt
        .setName("whitelist")
        .setDescription(t("cmd.edit.whitelist"))
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt
        .setName("blacklist")
        .setDescription(t("cmd.edit.blacklist"))
        .setRequired(false),
    ),

  async execute(interaction, rssData, saveRSS) {
    const id = interaction.options.getString("id", true);
    const feed = rssData.feeds.find((f) => f.id === id);

    if (!feed) {
      await interaction.reply(t("cmd.edit.invalid"));
      return;
    }

    const enabled = interaction.options.getBoolean("enabled") ?? undefined;
    const translate = interaction.options.getBoolean("translate") ?? undefined;
    const interval = interaction.options.getInteger("interval") ?? undefined;
    const role = interaction.options.getRole("role");
    const removeRole = interaction.options.getBoolean("remove_role") ?? false;
    const webhook = interaction.options.getString("webhook") ?? undefined;
    const whitelist = interaction.options.getString("whitelist") ?? undefined;
    const blacklist = interaction.options.getString("blacklist") ?? undefined;

    const changes: string[] = [];

    if (enabled !== undefined) {
      feed.enabled = enabled;
      changes.push(
        t(enabled ? "cmd.edit.lbl.enabled" : "cmd.edit.lbl.disabled"),
      );
    }

    if (translate !== undefined) {
      feed.translate = translate;
      changes.push(
        t(translate ? "cmd.edit.lbl.translateOn" : "cmd.edit.lbl.translateOff"),
      );
    }

    if (interval !== undefined) {
      if (interval > 0) {
        feed.intervalMinutes = interval;
        changes.push(t("cmd.edit.lbl.interval", { min: interval }));
      } else {
        delete feed.intervalMinutes;
        changes.push(t("cmd.edit.lbl.intervalGlobal"));
      }
    }

    if (role) {
      feed.roleId = role.id;
      changes.push(t("cmd.edit.lbl.role", { id: role.id }));
    }

    if (removeRole && feed.roleId) {
      delete feed.roleId;
      changes.push(t("cmd.edit.lbl.roleCleared"));
    }

    if (webhook !== undefined) {
      if (webhook.toLowerCase() === OFF) {
        delete feed.webhookUrl;
        changes.push(t("cmd.edit.lbl.webhookCleared"));
      } else if (WEBHOOK_RE.test(webhook)) {
        feed.webhookUrl = webhook;
        changes.push(t("cmd.edit.lbl.webhook"));
      } else {
        await interaction.reply({
          content: t("cmd.add.webhookInvalid"),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    if (whitelist !== undefined) {
      if (whitelist.toLowerCase() === OFF) {
        delete feed.whitelist;
        changes.push(t("cmd.edit.lbl.whitelistCleared"));
      } else {
        const kw = parseKeywords(whitelist);
        feed.whitelist = kw;
        changes.push(
          t("cmd.edit.lbl.whitelist", {
            kw: truncateDiscord(kw.join(", "), 50),
          }),
        );
      }
    }

    if (blacklist !== undefined) {
      if (blacklist.toLowerCase() === OFF) {
        delete feed.blacklist;
        changes.push(t("cmd.edit.lbl.blacklistCleared"));
      } else {
        const kw = parseKeywords(blacklist);
        feed.blacklist = kw;
        changes.push(
          t("cmd.edit.lbl.blacklist", {
            kw: truncateDiscord(kw.join(", "), 50),
          }),
        );
      }
    }

    if (changes.length === 0) {
      await interaction.reply(t("cmd.edit.noChanges"));
      return;
    }

    saveRSS();
    await interaction.reply(
      t("cmd.edit.success", { id, changes: changes.join(", ") }),
    );
  },
};

export = command;
