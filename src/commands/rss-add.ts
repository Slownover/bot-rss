import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";
import type { Command } from "../types.js";
import { generateUltimateHash } from "../utils/function.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-add")
    .setDescription("Add an RSS feed")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) =>
      opt.setName("url").setDescription("RSS feed URL").setRequired(true),
    )
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Trade show where to send items")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("sensitive")
        .setDescription(
          "URL contains sensitive data (tokens). Masked in /rss-list",
        )
        .setRequired(false),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("translate")
        .setDescription("Translate feed content (default: false)")
        .setRequired(false),
    ),

  async execute(interaction, rssData, saveRSS) {
    const url = interaction.options.getString("url", true);
    const channel = interaction.options.getChannel("channel", true);
    const sensitive = interaction.options.getBoolean("sensitive") ?? false;
    const translate = interaction.options.getBoolean("translate") ?? false;
    const id = await generateUltimateHash(8, url, channel.id);

    rssData.feeds.push({
      url,
      channel: channel.id,
      last: null,
      id,
      sensitive,
      translate,
    });

    saveRSS();
    await interaction.reply({
      content: `✔ Added feed : \`${url}\` → <#${channel.id}> (\`${id}\`)`,
      flags: sensitive ? MessageFlags.Ephemeral : undefined,
    });
  },
};

export = command;
