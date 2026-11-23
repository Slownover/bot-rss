import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../types.js";
import { sendDigest } from "../rss/digest.js";
import { t } from "../i18n.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-digest")
    .setDescription(t("cmd.digest.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, rssData) {
    if (!rssData.digest.length) {
      await interaction.reply({
        content: t("cmd.digest.empty"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const pending = rssData.digest.length;
    const sent = await sendDigest();

    await interaction.editReply(
      sent === null
        ? t("cmd.digest.running")
        : t("cmd.digest.sent", { sent, pending }),
    );
  },
};

export = command;
