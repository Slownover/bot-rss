import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command, Feed } from "../types.js";
import { generateUltimateHash } from "../utils/function.js";
import { t } from "../i18n.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-import")
    .setDescription(t("cmd.import.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addAttachmentOption((opt) =>
      opt
        .setName("file")
        .setDescription(t("cmd.import.file"))
        .setRequired(true),
    ),

  async execute(interaction, rssData, saveRSS) {
    const attachment = interaction.options.getAttachment("file", true);

    if (
      !attachment.name.toLowerCase().endsWith(".json") &&
      !attachment.contentType?.includes("json")
    ) {
      await interaction.reply({
        content: t("cmd.import.invalid", { message: "not a JSON file" }),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    let raw: unknown;
    try {
      const res = await fetch(attachment.url);
      raw = await res.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await interaction.reply({
        content: t("cmd.import.invalid", { message }),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const arr = (raw as { feeds?: unknown } | null)?.feeds;
    if (!Array.isArray(arr)) {
      await interaction.reply({
        content: t("cmd.import.invalid", { message: "missing feeds array" }),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const existingUrls = new Set(rssData.feeds.map((f) => f.url));
    let added = 0;
    let skipped = 0;

    for (const item of arr) {
      const src = item as Record<string, unknown>;
      if (typeof src.url !== "string" || !src.url.trim()) continue;
      if (typeof src.channel !== "string" || !src.channel.trim()) continue;
      if (existingUrls.has(src.url)) {
        skipped++;
        continue;
      }

      const feed: Feed = {
        url: src.url,
        channel: src.channel,
        last: typeof src.last === "string" ? src.last : null,
        id:
          typeof src.id === "string" && src.id.trim()
            ? src.id
            : await generateUltimateHash(8, src.url, src.channel),
        sensitive: src.sensitive === true,
        translate: src.translate === true,
      };

      const feedAny = feed as unknown as Record<string, unknown>;
      for (const key of [
        "enabled",
        "intervalMinutes",
        "roleId",
        "webhookUrl",
        "whitelist",
        "blacklist",
        "errorCount",
      ] as const) {
        if (src[key] !== undefined) {
          feedAny[key] = src[key];
        }
      }

      rssData.feeds.push(feed);
      existingUrls.add(src.url);
      added++;
    }

    saveRSS();

    await interaction.reply({
      content: t("cmd.import.success", { added, skipped }),
      flags: MessageFlags.Ephemeral,
    });
  },
};

export = command;
