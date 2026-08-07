import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { t } from "../i18n.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-edit")
    .setDescription(t("cmd.edit.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) =>
      opt
        .setName("id")
        .setDescription(t("cmd.edit.id"))
        .setRequired(true),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("translate")
        .setDescription(t("cmd.edit.translate"))
        .setRequired(true),
    ),

  async execute(interaction, rssData, saveRSS) {
    const id = interaction.options.getString("id", true);
    const translate = interaction.options.getBoolean("translate", true);

    const feed = rssData.feeds.find((f) => f.id === id);

    if (!feed) {
      await interaction.reply(t("cmd.edit.invalid"));
      return;
    }

    feed.translate = translate;
    saveRSS();

    await interaction.reply(
      t("cmd.edit.success", {
        id,
        state: translate ? t("cmd.edit.enabled") : t("cmd.edit.disabled"),
      }),
    );
  },
};

export = command;
