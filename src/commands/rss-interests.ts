import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command, RSSData } from "../types.js";
import { truncateDiscord } from "../utils/function.js";
import { normalizeKeyword } from "../rss/scoring.js";
import { config } from "../config.js";
import { t } from "../i18n.js";

const TOP_LEARNED = 10;

function formatWeight(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

function formatList(entries: [string, number][]): string {
  return entries.length
    ? entries.map(([k, w]) => `\`${k}\` ${formatWeight(w)}`).join(", ")
    : t("cmd.interests.none");
}

function buildSummary(rssData: RSSData): string {
  const { keywords, learned, sources } = rssData.interests;

  const manual = Object.entries(keywords).sort((a, b) => b[1] - a[1]);
  const learnedSorted = Object.entries(learned).sort((a, b) => b[1] - a[1]);
  const liked = learnedSorted.filter(([, w]) => w > 0).slice(0, TOP_LEARNED);
  const disliked = learnedSorted
    .filter(([, w]) => w < 0)
    .reverse()
    .slice(0, TOP_LEARNED);

  const sourceLines = Object.entries(sources)
    .sort((a, b) => b[1] - a[1])
    .map(([id, w]) => {
      const feed = rssData.feeds.find((f) => f.id === id);
      const label = feed?.site ?? id;
      return `\`${id}\` (${label}) ${formatWeight(w)}`;
    });

  return [
    t("cmd.interests.title"),
    t("cmd.interests.thresholds", {
      highlight: config.highlightScore,
      digest: config.digestScore,
    }),
    "",
    t("cmd.interests.keywords", { list: formatList(manual) }),
    t("cmd.interests.liked", { list: formatList(liked) }),
    t("cmd.interests.disliked", { list: formatList(disliked) }),
    t("cmd.interests.sources", {
      list: sourceLines.length ? sourceLines.join(", ") : t("cmd.interests.none"),
    }),
  ].join("\n");
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rss-interests")
    .setDescription(t("cmd.interests.description"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription(t("cmd.interests.add"))
        .addStringOption((opt) =>
          opt
            .setName("keyword")
            .setDescription(t("cmd.interests.keyword"))
            .setMaxLength(100)
            .setRequired(true),
        )
        .addIntegerOption((opt) =>
          opt
            .setName("weight")
            .setDescription(t("cmd.interests.weight"))
            .setMinValue(-10)
            .setMaxValue(10)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription(t("cmd.interests.remove"))
        .addStringOption((opt) =>
          opt
            .setName("keyword")
            .setDescription(t("cmd.interests.keyword"))
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName("list").setDescription(t("cmd.interests.list")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("reset-learned")
        .setDescription(t("cmd.interests.resetLearned")),
    ),

  async execute(interaction, rssData, saveRSS) {
    const reply = (content: string) =>
      interaction.reply({
        content: truncateDiscord(content, 2000),
        flags: MessageFlags.Ephemeral,
      });

    const sub = interaction.options.getSubcommand(true);
    const interests = rssData.interests;

    if (sub === "list") {
      await reply(buildSummary(rssData));
      return;
    }

    if (sub === "reset-learned") {
      interests.learned = {};
      interests.sources = {};
      for (const meta of Object.values(rssData.articles)) meta.voters = {};
      saveRSS();
      await reply(t("cmd.interests.resetDone"));
      return;
    }

    const keyword = normalizeKeyword(
      interaction.options.getString("keyword", true),
    );
    if (!keyword) {
      await reply(t("cmd.interests.invalidKeyword"));
      return;
    }

    if (sub === "remove") {
      if (!(keyword in interests.keywords)) {
        await reply(t("cmd.interests.notFound", { keyword }));
        return;
      }
      delete interests.keywords[keyword];
      saveRSS();
      await reply(t("cmd.interests.removed", { keyword }));
      return;
    }

    const weight = interaction.options.getInteger("weight", true);
    if (weight === 0) delete interests.keywords[keyword];
    else interests.keywords[keyword] = weight;
    saveRSS();
    await reply(
      weight === 0
        ? t("cmd.interests.removed", { keyword })
        : t("cmd.interests.added", { keyword, weight: formatWeight(weight) }),
    );
  },
};

export = command;
