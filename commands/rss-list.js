const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rss-list")
    .setDescription("Liste les flux RSS enregistrés"),

  async execute(interaction, rssData) {
    if (rssData.feeds.length === 0)
      return interaction.reply("Aucun flux enregistré.");

    const list = rssData.feeds
      .map((f) => `**\`${f.id}\`**: \`${f.url}\` → <#${f.channel}>`)
      .join("\n");

    await interaction.reply(list);
  },
};
