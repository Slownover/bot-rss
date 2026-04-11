const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rss-remove")
    .setDescription("Supprime un flux RSS")
    .addIntegerOption((opt) =>
      opt
        .setName("id")
        .setDescription("ID du flux (voir /rss-list)")
        .setRequired(true),
    ),

  async execute(interaction, rssData, saveRSS) {
    const id = interaction.options.getInteger("id") - 1;

    if (!rssData.feeds[id]) return interaction.reply("ID invalide.");

    const removed = rssData.feeds.splice(id, 1);
    saveRSS();

    await interaction.reply(`🗑️ Flux supprimé : \`${removed[0].url}\``);
  },
};
