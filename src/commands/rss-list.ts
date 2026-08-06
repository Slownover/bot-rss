import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-list")
    .setDescription("List of registered RSS feeds"),

  async execute(interaction, rssData) {
    if (rssData.feeds.length === 0) {
      await interaction.reply("No streams recorded.");
      return;
    }

    const list = rssData.feeds
      .map((f) => `**\`${f.id}\`**: \`${f.url}\` → <#${f.channel}>`)
      .join("\n");

    await interaction.reply(list);
  },
};

export = command;
