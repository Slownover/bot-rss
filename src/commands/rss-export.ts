import {
  AttachmentBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../types.js";
import { t } from "../i18n.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-export")
    .setDescription(t("cmd.export.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, rssData) {
    const payload = JSON.stringify({ feeds: rssData.feeds }, null, 2);
    const attachment = new AttachmentBuilder(Buffer.from(payload, "utf8"), {
      name: "rss-backup.json",
    });

    await interaction.reply({
      content: t("cmd.export.success", { count: rssData.feeds.length }),
      files: [attachment],
      flags: MessageFlags.Ephemeral,
    });
  },
};

export = command;
