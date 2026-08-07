import { config } from "./config.js";

const fr = {
  "cmd.add.description": "Ajouter un flux RSS",
  "cmd.add.url": "URL du flux RSS",
  "cmd.add.channel": "Salon où envoyer les articles",
  "cmd.add.sensitive":
    "L'URL contient des données sensibles (jetons). Masquée dans /rss-list",
  "cmd.add.translate": "Traduire le contenu du flux (défaut : non)",
  "cmd.add.success": "✔ Flux ajouté : `{url}` → <#{channel}> (`{id}`)",

  "cmd.remove.description": "Supprimer un flux RSS",
  "cmd.remove.id": "ID du flux (voir /rss-list)",
  "cmd.remove.invalid": "❌ ID invalide.",
  "cmd.remove.success": "🗑️ Flux supprimé : `{url}`",

  "cmd.list.description": "Liste des flux RSS enregistrés",
  "cmd.list.full": "Afficher la liste complète non censurée (permissions requises)",
  "cmd.list.empty": "Aucun flux enregistré.",
  "cmd.list.noPermission":
    "❌ Vous n'avez pas la permission de voir la liste complète.",
  "cmd.list.fullTitle": "**Liste complète des flux RSS**",
  "cmd.list.pageInfo": "Page {page}/{total}",
  "cmd.list.prev": "Page précédente",
  "cmd.list.next": "Page suivante",

  "cmd.edit.description": "Modifier un flux RSS",
  "cmd.edit.id": "ID du flux (voir /rss-list)",
  "cmd.edit.translate": "Activer ou désactiver la traduction du flux",
  "cmd.edit.invalid": "❌ ID invalide.",
  "cmd.edit.success": "✔ Traduction {state} pour `{id}`",
  "cmd.edit.enabled": "activée",
  "cmd.edit.disabled": "désactivée",

  "rss.noTitle": "Sans titre",
  "rss.noDescription": "Aucune description disponible",
  "rss.openLink": "Voir",

  "log.rssDataMissing":
    "rss.json n'existe pas ; il sera créé à la première inscription.",
  "log.clientReady": "Connecté en tant que {username}",
  "log.commandsRegistered": "{count} commande(s) enregistrée(s)",
  "log.commandError": "Erreur lors de l'exécution de la commande {name}",
  "log.commandsRegisterError": "Erreur lors de l'enregistrement des commandes",
  "log.rssError": "Erreur RSS ({url})",
  "log.rssCheckStart": "Vérification de {count} flux RSS",
  "log.rssCheckDone": "Vérification des flux terminée",
  "log.feedAdded": "Nouvel article : {title}",
  "log.rssSaveError": "Impossible de sauvegarder rss.json",
  "log.translationError": "Erreur de traduction",
  "log.translateApiError": "Erreur de l'API Google",
  "log.shutdown": "Arrêt du bot ({signal})…",
  "log.unhandledRejection": "Promesse rejetée non gérée",
  "log.uncaughtException": "Exception non capturée",
  "log.fatalError": "Erreur fatale au démarrage",
} as const;

const en: { [K in keyof typeof fr]: string } = {
  "cmd.add.description": "Add an RSS feed",
  "cmd.add.url": "RSS feed URL",
  "cmd.add.channel": "Channel where to send articles",
  "cmd.add.sensitive":
    "URL contains sensitive data (tokens). Masked in /rss-list",
  "cmd.add.translate": "Translate feed content (default: no)",
  "cmd.add.success": "✔ Feed added : `{url}` → <#{channel}> (`{id}`)",

  "cmd.remove.description": "Delete an RSS feed",
  "cmd.remove.id": "Feed ID (see /rss-list)",
  "cmd.remove.invalid": "❌ Invalid ID.",
  "cmd.remove.success": "🗑️ Feed deleted : `{url}`",

  "cmd.list.description": "List of registered RSS feeds",
  "cmd.list.full":
    "Show the full uncensored list (requires permissions)",
  "cmd.list.empty": "No feeds registered.",
  "cmd.list.noPermission":
    "❌ You don't have permission to view the full list.",
  "cmd.list.fullTitle": "**Full RSS feed list**",
  "cmd.list.pageInfo": "Page {page}/{total}",
  "cmd.list.prev": "Previous page",
  "cmd.list.next": "Next page",

  "cmd.edit.description": "Edit an RSS feed",
  "cmd.edit.id": "Feed ID (see /rss-list)",
  "cmd.edit.translate": "Enable or disable feed translation",
  "cmd.edit.invalid": "❌ Invalid ID.",
  "cmd.edit.success": "✔ Translation {state} for `{id}`",
  "cmd.edit.enabled": "enabled",
  "cmd.edit.disabled": "disabled",

  "rss.noTitle": "No title",
  "rss.noDescription": "No description available",
  "rss.openLink": "Open",

  "log.rssDataMissing":
    "rss.json does not exist; it will be created on the first registration.",
  "log.clientReady": "Connected as {username}",
  "log.commandsRegistered": "{count} command(s) registered",
  "log.commandError": "Error while executing command {name}",
  "log.commandsRegisterError": "Error while registering commands",
  "log.rssError": "RSS error ({url})",
  "log.rssCheckStart": "Checking {count} RSS feeds",
  "log.rssCheckDone": "Feed check finished",
  "log.feedAdded": "New article: {title}",
  "log.rssSaveError": "Unable to save rss.json",
  "log.translationError": "Translation error",
  "log.translateApiError": "Google API error",
  "log.shutdown": "Shutting down ({signal})…",
  "log.unhandledRejection": "Unhandled promise rejection",
  "log.uncaughtException": "Uncaught exception",
  "log.fatalError": "Fatal error during startup",
};

const supportedLangs = ["fr", "en"] as const;
export type Lang = (typeof supportedLangs)[number];
export type MessageKey = keyof typeof fr;

const currentLang: Lang = (supportedLangs as readonly string[]).includes(
  config.lang,
)
  ? (config.lang as Lang)
  : "fr";

const dictionaries: Record<Lang, { [K in MessageKey]: string }> = { fr, en };

export function t<K extends MessageKey>(
  key: K,
  params?: Record<string, string | number>,
): string {
  const template = dictionaries[currentLang][key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
