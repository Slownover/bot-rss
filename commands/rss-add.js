const { SlashCommandBuilder, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rss-add")
    .setDescription("Ajoute un flux RSS")
    .addStringOption((opt) =>
      opt.setName("url").setDescription("URL du flux RSS").setRequired(true),
    )
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Salon où envoyer les articles")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),

  async execute(interaction, rssData, saveRSS) {
    const url = interaction.options.getString("url");
    const channel = interaction.options.getChannel("channel");

    rssData.feeds.push({
      url,
      channel: channel.id,
      last: null,
    });

    saveRSS();
    await interaction.reply(`✔ Flux ajouté : \`${url}\` → <#${channel.id}>`);
  },
};
