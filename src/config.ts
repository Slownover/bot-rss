import fs from "fs";
import type { Config } from "./types.js";
import { resolveProjectFile } from "./utils/paths.js";
import { logger } from "./utils/logger.js";

const configPath = resolveProjectFile("config.json");

function loadConfig(): Config {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(
      { err },
      `Impossible de lire config.json (${configPath}) : ${message}`,
    );
    throw new Error(
      `Impossible de lire config.json (${configPath}) : ${message}`,
    );
  }

  const obj = (raw ?? {}) as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof obj.token !== "string" || !obj.token.trim()) {
    errors.push("token (obligatoire)");
  }
  if (typeof obj.guildId !== "string" || !obj.guildId.trim()) {
    errors.push("guildId (obligatoire)");
  }
  if (obj.googleApiKey !== undefined && typeof obj.googleApiKey !== "string") {
    errors.push("googleApiKey (string)");
  }
  if (
    obj.rssFetchCron !== undefined &&
    (typeof obj.rssFetchCron !== "string" || !obj.rssFetchCron.trim())
  ) {
    errors.push("rssFetchCron (expression cron)");
  }
  if (
    obj.targetLanguage !== undefined &&
    (typeof obj.targetLanguage !== "string" || obj.targetLanguage.trim().length !== 2)
  ) {
    errors.push("targetLanguage (code ISO 639-1)");
  }
  if (obj.lang !== undefined && obj.lang !== "fr" && obj.lang !== "en") {
    errors.push("lang (fr | en)");
  }
  if (
    obj.adminChannelId !== undefined &&
    typeof obj.adminChannelId !== "string"
  ) {
    errors.push("adminChannelId (id de salon)");
  }
  if (
    obj.maxFeedFailures !== undefined &&
    (typeof obj.maxFeedFailures !== "number" ||
      !Number.isInteger(obj.maxFeedFailures) ||
      obj.maxFeedFailures < 1)
  ) {
    errors.push("maxFeedFailures (entier >= 1)");
  }
  if (
    obj.digestCron !== undefined &&
    (typeof obj.digestCron !== "string" || !obj.digestCron.trim())
  ) {
    errors.push("digestCron (expression cron)");
  }
  if (
    obj.digestChannelId !== undefined &&
    typeof obj.digestChannelId !== "string"
  ) {
    errors.push("digestChannelId (id de salon)");
  }
  if (
    obj.highlightScore !== undefined &&
    (typeof obj.highlightScore !== "number" ||
      !Number.isFinite(obj.highlightScore))
  ) {
    errors.push("highlightScore (nombre)");
  }
  if (
    obj.digestScore !== undefined &&
    (typeof obj.digestScore !== "number" || !Number.isFinite(obj.digestScore))
  ) {
    errors.push("digestScore (nombre)");
  }
  if (
    typeof obj.highlightScore === "number" &&
    typeof obj.digestScore === "number" &&
    obj.digestScore > obj.highlightScore
  ) {
    errors.push("digestScore (doit être <= highlightScore)");
  }
  if (obj.votesEnabled !== undefined && typeof obj.votesEnabled !== "boolean") {
    errors.push("votesEnabled (booléen)");
  }
  if (obj.voteRoleId !== undefined && typeof obj.voteRoleId !== "string") {
    errors.push("voteRoleId (id de rôle)");
  }

  if (errors.length > 0) {
    const message = errors.join(", ");
    logger.error(`config.json invalide : ${message}`);
    throw new Error(`config.json invalide : ${message}`);
  }

  return {
    token: obj.token as string,
    guildId: obj.guildId as string,
    googleApiKey: (obj.googleApiKey as string | undefined) ?? "",
    rssFetchCron: (obj.rssFetchCron as string | undefined) ?? "*/2 * * * *",
    targetLanguage: (obj.targetLanguage as string | undefined) ?? "en",
    lang: obj.lang === "en" ? "en" : "fr",
    adminChannelId:
      (obj.adminChannelId as string | undefined)?.trim() || undefined,
    maxFeedFailures:
      typeof obj.maxFeedFailures === "number" ? obj.maxFeedFailures : undefined,
    digestCron: (obj.digestCron as string | undefined) ?? "0 8,18 * * *",
    digestChannelId:
      (obj.digestChannelId as string | undefined)?.trim() || undefined,
    highlightScore:
      typeof obj.highlightScore === "number" ? obj.highlightScore : 5,
    digestScore: typeof obj.digestScore === "number" ? obj.digestScore : 0,
    votesEnabled: obj.votesEnabled === true,
    voteRoleId: (obj.voteRoleId as string | undefined)?.trim() || undefined,
  };
}

export const config: Config = loadConfig();
