# 📰 RSS Bot 🤖

## 📘 Project Description

This project is an RSS bot developed in JavaScript that helps users automate their RSS feed management. It allows users to fetch, read, and manage RSS feeds from various sources.

## ✨ Features

- 🔄 Fetch RSS feeds from multiple sources
- 📚 Manage and organize your favorite feeds
- 🔔 Customizable alerts for new content
- 🧩 User-friendly API
- 🟩 Built with Node.js and npm

## 📦 Installation

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/Slownover/bot-rss.git
cd bot-rss
npm install
```

## ⚙️ Configuration

Before running the bot, you need to create a configuration file.  
By default, the project includes a `config-example.json` file, which serves as a template.  
To configure the bot, copy this file and rename it to `config.json`:

```bash
cp config-example.json config.json
```

Then fill in the required fields according to your setup.

### 🔧 Available Settings

- **token** — Your bot token (required to authenticate with Discord).
- **guildId** — The ID of the guild/server where the bot will operate.
- **googleApiKey** — API key used for Google-related features.
- **rssFetchIntervalMs** — Interval (in milliseconds) at which RSS feeds are fetched.  
  Default: `120000` (2 minutes)
- **targetLanguage** — Language code used for translations or processing.  
  Default: `"en"`

### 📝 Example `config.json`

```json
{
  "token": "",
  "guildId": "",
  "googleApiKey": "",
  "rssFetchIntervalMs": 120000,
  "targetLanguage": "en"
}
```

Make sure to fill in all required credentials before starting the bot.

## 🚀 Usage

To run the RSS bot, use the following command:

```bash
node index.js
```

Make sure to configure your feeds in the config.json file according to your preferences.

## 🤝 Contribution Guidelines

Contributions are welcome! Please follow these steps:

1. 🍴 Fork the repository.
2. 🌿 Create a new branch (`git checkout -b feature-branch`).
3. 🛠️ Make your changes and commit them (`git commit -m 'Add some feature'`).
4. 📤 Push to the branch (`git push origin feature-branch`).
5. 🔁 Open a pull request.

## 📄 License

This project is licensed under the MIT License, see the [LICENSE](./LICENSE) file for details.
