import fs from "fs";
import path from "path";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
} from "discord.js";
import type { Command, RSSBotClient } from "../types.js";
import { config } from "../config.js";
import { rssData, saveRSS } from "../utils/function.js";

const commandsDir = path.join(__dirname, "..", "commands");

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
}) as RSSBotClient;

client.commands = new Collection<string, Command>();

const commandsJSON: ReturnType<Command["data"]["toJSON"]>[] = [];

for (const file of fs
  .readdirSync(commandsDir)
  .filter((f) => f.endsWith(".js") || f.endsWith(".ts"))) {
  const cmd = require(path.join(commandsDir, file)) as Command;
  client.commands.set(cmd.data.name, cmd);
  commandsJSON.push(cmd.data.toJSON());
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction, rssData, saveRSS);
  } catch (err) {
    console.error("An error occurred while executing the command: ", err);
  }
});

client.once(Events.ClientReady, async () => {
  console.log(`Connected as ${client.user?.username ?? "unknown"}`);
  try {
    const guild = await client.guilds.fetch(config.guildId);
    await guild.commands.set(commandsJSON);
    console.log(`✅ ${commandsJSON.length} registered commands`);
  } catch (err) {
    console.error("An error occurred while registering the commands: ", err);
  }
});
