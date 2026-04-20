const { SlashCommandBuilder } = require("discord.js");

module.exports = {
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
    const id = interaction.options.getString("id");

    // Trouver l'index du feed
    const index = rssData.feeds.findIndex((f) => f.id === id);

    if (index === -1) {
      return interaction.reply("❌ Invalid ID.");
    }

    // Supprimer le feed
    const removed = rssData.feeds.splice(index, 1)[0];

    // Sauvegarder
    saveRSS();

    await interaction.reply(`🗑️ Feed deleted : \`${removed.url}\``);
  },
};
