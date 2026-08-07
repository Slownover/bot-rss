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
}

export interface RSSData {
  feeds: Feed[];
}

export interface Config {
  token: string;
  guildId: string;
  googleApiKey: string;
  rssFetchCron: string;
  targetLanguage: string;
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
