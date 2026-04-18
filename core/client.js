const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

const config = require("../config.json");
const { rssData, saveRSS } = require("../utils/function.js");
const commandsDirPath = path.join(__dirname, "..", "commands");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.commands = new Collection();
const commandFiles = fs
  .readdirSync(commandsDirPath)
  .filter((f) => f.endsWith(".js"));
const commandsJSON = [];

for (const file of commandFiles) {
  const cmd = require(path.join(commandsDirPath, file));
  client.commands.set(cmd.data.name, cmd);
  commandsJSON.push(cmd.data.toJSON());
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  await cmd.execute(interaction, rssData, saveRSS);
});

// Ready
client.once("clientReady", async () => {
  console.log(`Connected as ${client.user.tag}`);
  try {
    const guild = await client.guilds.cache.get(config.guildId);
    await guild.commands.set(commandsJSON);
    console.log(`✅ ${commandsJSON.length} registered commands`);
  } catch (err) {
    console.error("An error occurred while registering the commands: ", err);
  }
});

module.exports = { client };
