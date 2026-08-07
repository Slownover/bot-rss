import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../types.js";
import { getDomain } from "../utils/function.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-list")
    .setDescription("List of registered RSS feeds")
    .addBooleanOption((opt) =>
      opt
        .setName("full")
        .setDescription("Show the full uncensored list (requires permissions)")
        .setRequired(false),
    ),

  async execute(interaction, rssData) {
    if (rssData.feeds.length === 0) {
      await interaction.reply("No streams recorded.");
      return;
    }

    const showFull = interaction.options.getBoolean("full") ?? false;

    if (showFull) {
      const allowed = interaction.memberPermissions?.has(
        PermissionFlagsBits.ManageMessages,
      );

      if (!allowed) {
        await interaction.reply({
          content:
            "❌ You don't have permission to view the full uncensored list.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const fullList = rssData.feeds
        .map((f) => `**\`${f.id}\`**: \`${f.url}\` → <#${f.channel}>`)
        .join("\n");

      await interaction.reply({
        content: fullList,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const list = rssData.feeds
      .map((f) => {
        const url = f.sensitive
          ? `\`${getDomain(f.url) ?? "unknown"}/...\``
          : `\`${f.url}\``;
        return `**\`${f.id}\`**: ${url} → <#${f.channel}>`;
      })
      .join("\n");

    await interaction.reply(list);
  },
};

export = command;
