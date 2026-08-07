import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../types.js";
import { t } from "../i18n.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-remove")
    .setDescription(t("cmd.remove.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) =>
      opt
        .setName("id")
        .setDescription(t("cmd.remove.id"))
        .setRequired(true),
    ),

  async execute(interaction, rssData, saveRSS) {
    const id = interaction.options.getString("id", true);

    const index = rssData.feeds.findIndex((f) => f.id === id);

    if (index === -1) {
      await interaction.reply(t("cmd.remove.invalid"));
      return;
    }

    const removed = rssData.feeds.splice(index, 1)[0];

    saveRSS();

    await interaction.reply({
      content: t("cmd.remove.success", { url: removed.url }),
      flags: removed.sensitive ? MessageFlags.Ephemeral : undefined,
    });
  },
};

export = command;
