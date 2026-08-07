import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-edit")
    .setDescription("Edit an RSS feed")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) =>
      opt
        .setName("id")
        .setDescription("Feed ID (see /rss-list)")
        .setRequired(true),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("translate")
        .setDescription("Whether the feed content should be translated")
        .setRequired(true),
    ),

  async execute(interaction, rssData, saveRSS) {
    const id = interaction.options.getString("id", true);
    const translate = interaction.options.getBoolean("translate", true);

    const feed = rssData.feeds.find((f) => f.id === id);

    if (!feed) {
      await interaction.reply("❌ Invalid ID.");
      return;
    }

    feed.translate = translate;
    saveRSS();

    await interaction.reply(
      `✔ Translation ${translate ? "enabled" : "disabled"} for \`${id}\``,
    );
  },
};

export = command;
