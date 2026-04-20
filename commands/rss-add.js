const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { generateUltimateHash } = require("../utils/function.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rss-add")
    .setDescription("Add an RSS feed")
    .addStringOption((opt) =>
      opt.setName("url").setDescription("RSS feed URL").setRequired(true),
    )
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Trade show where to send items")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),

  async execute(interaction, rssData, saveRSS) {
    const url = interaction.options.getString("url");
    const channel = interaction.options.getChannel("channel");
    const id = await generateUltimateHash(8, url, channel.id);

    rssData.feeds.push({
      url,
      channel: channel.id,
      last: null,
      id,
    });

    saveRSS();
    await interaction.reply(
      `✔ Added feed : \`${url}\` → <#${channel.id}> (\`${id}\`)`,
    );
  },
};
