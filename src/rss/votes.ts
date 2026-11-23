import {
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionFlagsBits,
  type ButtonInteraction,
} from "discord.js";
import { config } from "../config.js";
import { t } from "../i18n.js";
import { saveRSS } from "../utils/function.js";
import { applyVote } from "./scoring.js";

export const VOTE_PREFIX = "vote:";
const VOTE_RE = /^vote:(up|down):([\w-]+)$/;

export function buildVoteButtons(key: string): ButtonBuilder[] {
  return [
    new ButtonBuilder()
      .setCustomId(`${VOTE_PREFIX}up:${key}`)
      .setEmoji("👍")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${VOTE_PREFIX}down:${key}`)
      .setEmoji("👎")
      .setStyle(ButtonStyle.Secondary),
  ];
}

/**
 * The interest profile is shared by the whole server, so only moderators
 * (ManageMessages) or members with `voteRoleId` may vote.
 */
function canVote(interaction: ButtonInteraction): boolean {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
    return true;
  }
  const roleId = config.voteRoleId;
  if (!roleId) return false;
  const roles = interaction.member?.roles;
  if (!roles) return false;
  return Array.isArray(roles) ? roles.includes(roleId) : roles.cache.has(roleId);
}

export async function handleVoteButton(
  interaction: ButtonInteraction,
): Promise<void> {
  const reply = (content: string) =>
    interaction.reply({ content, flags: MessageFlags.Ephemeral });

  const match = VOTE_RE.exec(interaction.customId);
  if (!config.votesEnabled || !match) {
    await reply(t("vote.disabled"));
    return;
  }

  if (!canVote(interaction)) {
    await reply(t("vote.noPermission"));
    return;
  }

  const direction = match[1] === "up" ? 1 : -1;
  const result = applyVote(match[2], interaction.user.id, direction);

  if (result === "unknown") {
    await reply(t("vote.unknown"));
    return;
  }
  if (result !== "unchanged") saveRSS();

  const emoji = direction === 1 ? "👍" : "👎";
  await reply(
    result === "unchanged"
      ? t("vote.unchanged", { emoji })
      : t("vote.recorded", { emoji }),
  );
}
