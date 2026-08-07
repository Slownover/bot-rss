# 📰 RSS Bot 🤖

A Discord bot in TypeScript that monitors RSS feeds and posts new articles to a channel, with optional automatic translation.

## ✨ Features

- 🔄 Fetches RSS/Atom feeds from multiple sources (with retry + backoff)
- 📚 Manages feeds with slash commands (`/rss-add`, `/rss-remove`, `/rss-edit`, `/rss-list`)
- ⏸ Pause/resume feeds per feed without deleting them (`enabled`)
- 🕒 Per-feed polling frequency (`intervalMinutes`), the global `rssFetchCron` applies to the rest
- 🔍 Keyword filters (`whitelist` / `blacklist`) to only post relevant articles
- 👥 Role mention when an article is posted (`role`)
- 🔗 Optional Discord webhook mirror of every post (`webhook`)
- 📋 Preview before adding: `/rss-add` validates the feed and shows the latest article title before saving
- 🔔 Admin alert when a feed fails N consecutive checks (`adminChannelId` + `maxFeedFailures`)
- 🚫 Duplicate protection via a posted-articles history, even if a feed reorders its items
- 📊 `/rss-stats` for post/error statistics
- 💾 `/rss-export` / `/rss-import` for feed backup & restore
- 🖼️ In-memory favicon cache to limit network requests
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

| Field              | Required | Default         | Description                                                                |
| ------------------ | -------- | --------------- | -------------------------------------------------------------------------- |
| `token`            | ✅       | —               | Discord bot token.                                                         |
| `guildId`          | ✅       | —               | ID of the guild where the bot registers commands.                          |
| `googleApiKey`     | —        | `""`            | Key used by the translate API.                                             |
| `rssFetchCron`     | —        | `"*/2 * * * *"` | Cron expression for the default polling frequency.                         |
| `targetLanguage`   | —        | `"en"`          | Language code used to translate feed content.                              |
| `lang`             | —        | `"fr"`          | Bot UI language: `"fr"` or `"en"`.                                         |
| `adminChannelId`   | —        | `""`            | Channel ID where feed failure alerts are posted.                           |
| `maxFeedFailures`  | —        | `5`             | Consecutive failures before sending a feed alert.                          |

### 2. Create `rss.json`

Feed settings are stored in `rss.json` (gitignored). A template is provided:

```bash
cp rss-example.json rss.json
```

This file is managed automatically by the bot and created on the first feed registration.

Every feed supports these optional fields (set via `/rss-add` or `/rss-edit`):

| Field             | Type            | Description                                             |
| ----------------- | --------------- | ------------------------------------------------------- |
| `enabled`         | `boolean`       | Set to `false` to pause the feed without deleting it.   |
| `intervalMinutes` | `number`        | Custom polling interval; unset uses the global cron.    |
| `whitelist`       | `string[]`      | Only post articles containing at least one keyword.     |
| `blacklist`       | `string[]`      | Skip articles containing any keyword.                   |
| `roleId`          | `string`        | Role to mention when an article is posted.              |
| `webhookUrl`      | `string`        | Discord webhook URL that also receives each article.    |
| `sensitive`       | `boolean`       | Masks the feed URL in `/rss-list`.                      |
| `translate`       | `boolean`       | Translates article content to `targetLanguage`.         |

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

| Command        | Description                                                                                                                          | Permissions      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| `/rss-add`     | Add an RSS feed: validates it, shows a preview of the latest article, then adds (`url`, `channel` required; `sensitive`, `translate`, `role`, `interval`, `whitelist`, `blacklist`, `webhook` optional). | `ManageMessages` |
| `/rss-edit`    | Edit a feed: `enabled`, `translate`, `interval` (0 = global), `role`, `remove_role`, `webhook`/`whitelist`/`blacklist` (`off` clears). | `ManageMessages` |
| `/rss-remove`  | Delete a feed by its ID (`id`).                                                                                                      | `ManageMessages` |
| `/rss-list`    | List feeds with status badges (`full` requires `ManageMessages` to show unmasked URLs).                                              | anyone           |
| `/rss-stats`   | Show feed/post/error statistics.                                                                                                     | anyone           |
| `/rss-export`  | Download the feeds as a JSON backup file.                                                                                            | `ManageMessages` |
| `/rss-import`  | Restore feeds from an exported JSON file (URL duplicates are skipped).                                                               | `ManageMessages` |

Feed IDs are generated automatically and shown by `/rss-add` and `/rss-list`.

## 🗂️ Architecture

```
src/
├── index.ts              # Entry point, graceful shutdown
├── config.ts             # Config loading + validation
├── i18n.ts               # Translations (fr/en) and t()
├── translate.ts          # Google translate client
├── types.ts              # Shared TypeScript types
├── core/
│   ├── client.ts         # Discord client, command loader/registration
│   └── rssScheduler.ts   # Cron scheduler (default feeds + per-minute interval tick)
├── rss/
│   ├── rssManager.ts     # Feed checks, card building, filters, webhook, error alerts
│   ├── feedFetcher.ts    # Feed parsing with retry (shared with commands)
│   └── favicon.ts        # Site favicon fetching + in-memory cache
├── commands/             # One file per slash command (auto-loaded)
└── utils/
    ├── logger.ts         # pino logger
    ├── concurrency.ts    # mapLimit helper
    ├── function.ts       # Shared helpers + rss.json persistence
    ├── http.ts           # Axios instance with DNS caching
    └── paths.ts          # Project file resolution
```

## 🔧 Troubleshooting

- **`config.json invalide : ...`** — a required field is missing or malformed. Fix the listed field(s) and restart.
- **`Impossible de lire config.json ...`** — the file is missing or is not valid JSON. Copy `config-example.json`.
- **Commands not appearing on Discord** — check `guildId` and that the bot has the right intents/permissions; restart to re-register.
- **A feed never posts** — check the logs (`ERROR RSS error (url)`); the URL may be unreachable or the feed malformed.
- **A feed is paused but still in the list** — `enabled: false` keeps the feed without polling it; re-enable it with `/rss-edit id enabled:true`.
- **No admin alert received** — set `adminChannelId` in `config.json` (a text channel where the bot can send messages).

## 🤝 Contribution

1. 🍴 Fork the repository.
2. 🌿 Create a branch (`git checkout -b feature-branch`).
3. 🛠️ Make changes and commit (`git commit -m 'Add some feature'`).
4. 📤 Push (`git push origin feature-branch`).
5. 🔁 Open a pull request.

## 📄 License

MIT — see the [LICENSE](./LICENSE) file.
