# 📰 RSS Bot 🤖

A Discord bot in TypeScript that monitors RSS feeds and posts new articles to a channel, with optional automatic translation.

## ✨ Features

- 🔄 Fetches RSS/Atom feeds from multiple sources (with retry + backoff)
- 📚 Manages feeds with slash commands (`/rss-add`, `/rss-remove`, `/rss-edit`, `/rss-list`)
- 🔔 Sends new articles as Discord Components v2 cards with thumbnail/favicon
- 🌐 Optional content translation (Google translate API)
- 🔒 `sensitive` flag to mask feed URLs in `/rss-list`
- ⚡ Parallel feed checking with bounded concurrency
- 📄 Paginated feed list when there are many feeds
- 🌍 i18n (French / English) for bot messages
- 🧹 Structured logs (pino), atomic JSON persistence, graceful shutdown

## 📦 Installation

```bash
git clone https://github.com/Slownover/bot-rss.git
cd bot-rss
npm install
```

Requires Node.js >= 22.19.

## ⚙️ Configuration

### 1. Create `config.json`

Copy `config-example.json` and rename it to `config.json`:

```bash
cp config-example.json config.json
```

| Field            | Required | Default         | Description                                       |
| ---------------- | -------- | --------------- | ------------------------------------------------- |
| `token`          | ✅       | —               | Discord bot token.                                |
| `guildId`        | ✅       | —               | ID of the guild where the bot registers commands. |
| `googleApiKey`   | —        | `""`            | Key used by the translate API.                    |
| `rssFetchCron`   | —        | `"*/2 * * * *"` | Cron expression for the RSS polling frequency.    |
| `targetLanguage` | —        | `"en"`          | Language code used to translate feed content.     |
| `lang`           | —        | `"fr"`          | Bot UI language: `"fr"` or `"en"`.                |

### 2. Create `rss.json`

Feed settings are stored in `rss.json` (gitignored). A template is provided:

```bash
cp rss-example.json rss.json
```

This file is managed automatically by the bot and created on the first feed registration.

## 🚀 Usage

```bash
npm run build && npm start
```

Development with hot-reload:

```bash
npm run dev
```

Log level can be set via the `LOG_LEVEL` environment variable (`trace`, `debug`, `info`, `warn`, `error`, default `info`).

## 📚 Commands

| Command       | Description                                                                        | Permissions      |
| ------------- | ---------------------------------------------------------------------------------- | ---------------- |
| `/rss-add`    | Add an RSS feed to a channel (`url`, `channel`, optional `sensitive`/`translate`). | `ManageMessages` |
| `/rss-remove` | Delete a feed by its ID (`id`).                                                    | `ManageMessages` |
| `/rss-edit`   | Enable/disable translation of a feed (`id`, `translate`).                          | `ManageMessages` |
| `/rss-list`   | List feeds (`full` requires `ManageMessages` to show unmasked URLs).               | anyone           |

Feed IDs are generated automatically and shown by `/rss-add` and `/rss-list`.

## 🔧 Troubleshooting

- **`config.json invalide : ...`** — a required field is missing or malformed. Fix the listed field(s) and restart.
- **`Impossible de lire config.json ...`** — the file is missing or is not valid JSON. Copy `config-example.json`.
- **Commands not appearing on Discord** — check `guildId` and that the bot has the right intents/permissions; restart to re-register.
- **A feed never posts** — check the logs (`ERROR RSS error (url)`); the URL may be unreachable or the feed malformed.

## 🤝 Contribution

1. 🍴 Fork the repository.
2. 🌿 Create a branch (`git checkout -b feature-branch`).
3. 🛠️ Make changes and commit (`git commit -m 'Add some feature'`).
4. 📤 Push (`git push origin feature-branch`).
5. 🔁 Open a pull request.

## 📄 License

MIT — see the [LICENSE](./LICENSE) file.
