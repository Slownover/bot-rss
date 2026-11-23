import type {
  ChatInputCommandInteraction,
  Client,
  Collection,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export interface Feed {
  url: string;
  channel: string;
  last: string | null;
  id: string;
  site?: string;
  sensitive?: boolean;
  translate?: boolean;
  enabled?: boolean;
  intervalMinutes?: number;
  roleId?: string;
  webhookUrl?: string;
  whitelist?: string[];
  blacklist?: string[];
  digest?: boolean;
  errorCount?: number;
  lastCheckedAt?: number;
}

export interface RSSStats {
  postedCount: number;
  lastPostAt: string | null;
}

export interface InterestProfile {
  /** Manually set keyword weights (lowercased, accents stripped). */
  keywords: Record<string, number>;
  /** Title-word weights learned from votes. */
  learned: Record<string, number>;
  /** Per-feed weights learned from votes, keyed by feed ID. */
  sources: Record<string, number>;
}

export interface DigestEntry {
  feedId: string;
  channel: string;
  title: string;
  link: string;
  site: string;
  score: number;
  addedAt: string;
}

export interface ArticleMeta {
  feedId: string;
  title: string;
  /** Discord user ID → last vote (1 = up, -1 = down). */
  voters: Record<string, 1 | -1>;
}

export interface RSSData {
  feeds: Feed[];
  sent: string[];
  stats: RSSStats;
  interests: InterestProfile;
  digest: DigestEntry[];
  articles: Record<string, ArticleMeta>;
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
  digestCron: string;
  digestChannelId?: string;
  highlightScore: number;
  digestScore: number;
  votesEnabled: boolean;
  voteRoleId?: string;
}

export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  execute: (
    interaction: ChatInputCommandInteraction,
    rssData: RSSData,
    saveRSS: () => void,
  ) => Promise<void> | void;
}

export interface RSSBotClient extends Client {
  commands: Collection<string, Command>;
}
