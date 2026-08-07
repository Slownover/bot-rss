import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  MessageFlags,
} from "discord.js";
import type { Command } from "../types.js";
import { generateUltimateHash } from "../utils/function.js";
import { t } from "../i18n.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-add")
    .setDescription(t("cmd.add.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) =>
      opt
        .setName("url")
        .setDescription(t("cmd.add.url"))
        .setRequired(true),
    )
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription(t("cmd.add.channel"))
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("sensitive")
        .setDescription(t("cmd.add.sensitive"))
        .setRequired(false),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("translate")
        .setDescription(t("cmd.add.translate"))
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
      content: t("cmd.add.success", { url, channel: channel.id, id }),
      flags: sensitive ? MessageFlags.Ephemeral : undefined,
    });
  },
};

export = command;
