import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { t } from "../i18n.js";

function formatRelative(iso: string | null): string {
  if (!iso) return t("cmd.stats.never");
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return t("cmd.stats.justNow");
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return t("cmd.stats.minutesAgo", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("cmd.stats.hoursAgo", { n: hours });
  return t("cmd.stats.daysAgo", { n: Math.floor(hours / 24) });
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-stats")
    .setDescription(t("cmd.stats.description")),

  async execute(interaction, rssData) {
    const total = rssData.feeds.length;
    const active = rssData.feeds.filter((f) => f.enabled !== false).length;
    const failed = rssData.feeds.filter((f) => (f.errorCount ?? 0) > 0).length;
    const percent = total ? Math.round((failed / total) * 100) : 0;

    const content = [
      t("cmd.stats.title"),
      t("cmd.stats.feeds", { count: total, active }),
      t("cmd.stats.posted", { count: rssData.stats.postedCount }),
      t("cmd.stats.lastPost", {
        date: formatRelative(rssData.stats.lastPostAt),
      }),
      t("cmd.stats.failureRate", { failed, total, percent }),
    ].join("\n");

    await interaction.reply(content);
  },
};

export = command;
