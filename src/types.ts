import type {
  ChatInputCommandInteraction,
  Client,
  Collection,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";

export interface Feed {
  url: string;
  channel: string;
  last: string | null;
  id: string;
  sensitive?: boolean;
  translate?: boolean;
  enabled?: boolean;
  intervalMinutes?: number;
  roleId?: string;
  webhookUrl?: string;
  whitelist?: string[];
  blacklist?: string[];
  errorCount?: number;
  lastCheckedAt?: number;
}

export interface RSSStats {
  postedCount: number;
  lastPostAt: string | null;
}

export interface RSSData {
  feeds: Feed[];
  sent: string[];
  stats: RSSStats;
}

export interface Config {
  token: string;
  guildId: string;
  googleApiKey: string;
  rssFetchCron: string;
  targetLanguage: string;
  lang: "fr" | "en";
  adminChannelId?: string;
  maxFeedFailures?: number;
}

export interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (
    interaction: ChatInputCommandInteraction,
    rssData: RSSData,
    saveRSS: () => void,
  ) => Promise<void> | void;
}

export interface RSSBotClient extends Client {
  commands: Collection<string, Command>;
}
