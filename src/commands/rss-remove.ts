import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-remove")
    .setDescription("Delete an RSS feed")
    .addStringOption((opt) =>
      opt
        .setName("id")
        .setDescription("Feed ID (see /rss-list)")
        .setRequired(true),
    ),

  async execute(interaction, rssData, saveRSS) {
    const id = interaction.options.getString("id", true);

    const index = rssData.feeds.findIndex((f) => f.id === id);

    if (index === -1) {
      await interaction.reply("❌ Invalid ID.");
      return;
    }

    const removed = rssData.feeds.splice(index, 1)[0];

    saveRSS();

    await interaction.reply(`🗑️ Feed deleted : \`${removed.url}\``);
  },
};

export = command;
