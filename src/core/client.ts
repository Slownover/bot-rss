import fs from "fs";
import path from "path";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import type { Command, RSSBotClient } from "../types.js";
import { config } from "../config.js";
import { rssData, saveRSS } from "../utils/function.js";
import { logger } from "../utils/logger.js";
import { t } from "../i18n.js";

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
    logger.error(
      { err },
      t("log.commandError", { name: interaction.commandName }),
    );
  }
});

client.once(Events.ClientReady, async () => {
  logger.info(
    t("log.clientReady", { username: client.user?.username ?? "unknown" }),
  );
  console.log(
    t("log.clientReady", { username: client.user?.username ?? "unknown" }),
  );
  logger.info(
    t("log.applicationInfo", { id: client.application?.id ?? "unknown" }),
  );
  try {
    const application = client.application;
    const globalCmds = await application?.commands.fetch();
    if (application && globalCmds && globalCmds.size > 0) {
      await application.commands.set([]);
      logger.warn(t("log.globalCommandsCleared", { count: globalCmds.size }));
    }

    const guild = await client.guilds.fetch(config.guildId);
    await guild.commands.set(commandsJSON);
    logger.info(t("log.commandsRegistered", { count: commandsJSON.length }));

    const synced = await guild.commands.fetch();
    logger.info(
      t("log.commandsSynced", {
        names: synced.map((c) => `/${c.name}`).join(", ") || "∅",
      }),
    );
  } catch (err) {
    logger.error({ err }, t("log.commandsRegisterError"));
  }
});
