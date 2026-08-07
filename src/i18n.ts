import { config } from "./config.js";

const fr = {
  "cmd.add.description": "Ajouter un flux RSS",
  "cmd.add.url": "URL du flux RSS",
  "cmd.add.channel": "Salon où envoyer les articles",
  "cmd.add.sensitive":
    "L'URL contient des données sensibles (jetons). Masquée dans /rss-list",
  "cmd.add.translate": "Traduire le contenu du flux (défaut : non)",
  "cmd.add.role": "Rôle à mentionner quand un article sort",
  "cmd.add.interval":
    "Fréquence personnalisée en minutes (défaut : fréquence globale)",
  "cmd.add.whitelist":
    "Mots-clés (séparés par des virgules) : seuls les articles en contenant un sont postés",
  "cmd.add.blacklist":
    "Mots-clés (séparés par des virgules) : les articles en contenant un sont ignorés",
  "cmd.add.webhook":
    "URL d'un webhook Discord : envoi supplémentaire à ce webhook",
  "cmd.add.preview": "**Aperçu du flux**\n📰 {title}\n🔗 {link}\n\nL'article le plus récent sera publié lors de la prochaine vérification.\nAjouter ce flux ?",
  "cmd.add.confirm": "Ajouter",
  "cmd.add.cancel": "Annuler",
  "cmd.add.cancelled": "Ajout annulé.",
  "cmd.add.success": "✔ Flux ajouté : `{url}` → <#{channel}> (`{id}`)",
  "cmd.add.invalidFeed":
    "❌ Impossible de lire un flux à cette URL. Vérifiez qu'il s'agit bien d'un flux RSS/Atom valide.",
  "cmd.add.webhookInvalid": "❌ L'URL webhook fournie n'est pas valide.",
  "cmd.add.roleNotMentionable":
    "⚠️ Ce rôle n'est pas mentionnable : la mention ne fonctionnera peut-être pas.",

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
  "cmd.list.paused": "⏸ en pause",
  "cmd.list.customInterval": "🕒 {min} min",
  "cmd.list.filtered": "🔍 filtré",
  "cmd.list.translated": "🌐",
  "cmd.list.role": "👥 @{role}",

  "cmd.edit.description": "Modifier un flux RSS",
  "cmd.edit.id": "ID du flux (voir /rss-list)",
  "cmd.edit.translate": "Activer ou désactiver la traduction du flux",
  "cmd.edit.enable": "Activer ou mettre en pause le flux",
  "cmd.edit.interval": "Nouvelle fréquence en minutes (0 = fréquence globale)",
  "cmd.edit.role": "Rôle à mentionner",
  "cmd.edit.removeRole": "Retirer le rôle mentionné",
  "cmd.edit.webhook": "URL du webhook ('off' pour retirer)",
  "cmd.edit.whitelist":
    "Mots-clés whitelist ('off' pour vider, virgules pour séparer)",
  "cmd.edit.blacklist":
    "Mots-clés blacklist ('off' pour vider, virgules pour séparer)",
  "cmd.edit.invalid": "❌ ID invalide.",
  "cmd.edit.noChanges": "❌ Aucun champ à modifier fourni.",
  "cmd.edit.success": "✔ Flux `{id}` mis à jour : {changes}",
  "cmd.edit.enabled": "activée",
  "cmd.edit.disabled": "désactivée",
  "cmd.edit.lbl.enabled": "flux activé",
  "cmd.edit.lbl.disabled": "flux en pause",
  "cmd.edit.lbl.translateOn": "traduction activée",
  "cmd.edit.lbl.translateOff": "traduction désactivée",
  "cmd.edit.lbl.interval": "fréquence {min} min",
  "cmd.edit.lbl.intervalGlobal": "fréquence globale",
  "cmd.edit.lbl.role": "rôle <@&{id}>",
  "cmd.edit.lbl.roleCleared": "rôle retiré",
  "cmd.edit.lbl.webhook": "webhook défini",
  "cmd.edit.lbl.webhookCleared": "webhook retiré",
  "cmd.edit.lbl.whitelist": "whitelist : {kw}",
  "cmd.edit.lbl.whitelistCleared": "whitelist vidée",
  "cmd.edit.lbl.blacklist": "blacklist : {kw}",
  "cmd.edit.lbl.blacklistCleared": "blacklist vidée",

  "cmd.stats.description": "Statistiques du bot RSS",
  "cmd.stats.title": "**📊 Statistiques RSS**",
  "cmd.stats.feeds": "Flux : {count} (actifs : {active})",
  "cmd.stats.posted": "Articles postés : {count}",
  "cmd.stats.lastPost": "Dernier post : {date}",
  "cmd.stats.failureRate": "Flux en erreur : {failed}/{total} ({percent}%)",
  "cmd.stats.never": "jamais",
  "cmd.stats.justNow": "à l'instant",
  "cmd.stats.minutesAgo": "il y a {n} min",
  "cmd.stats.hoursAgo": "il y a {n} h",
  "cmd.stats.daysAgo": "il y a {n} j",

  "cmd.export.description": "Exporter les flux RSS en fichier JSON",
  "cmd.export.success": "Export de {count} flux prêt.",
  "cmd.import.description": "Importer des flux RSS depuis un fichier JSON",
  "cmd.import.file": "Fichier JSON à importer",
  "cmd.import.success":
    "✔ {added} flux importé(s), {skipped} ignoré(s) (déjà présents).",
  "cmd.import.invalid": "❌ Fichier invalide : {message}",

  "rss.noTitle": "Sans titre",
  "rss.noDescription": "Aucune description disponible",
  "rss.openLink": "Voir",
  "rss.feedErrorAlert":
    "🚨 Le flux `{url}` échoue depuis {count} vérifications consécutives. Vérifiez sa disponibilité ou supprimez-le avec /rss-remove.",
  "rss.feedRecovered": "✅ Le flux `{url}` fonctionne à nouveau.",

  "log.rssDataMissing":
    "rss.json n'existe pas ; il sera créé à la première inscription.",
  "log.clientReady": "Connecté en tant que {username}",
  "log.commandsRegistered": "{count} commande(s) enregistrée(s)",
  "log.applicationInfo": "Application connectée (ID {id})",
  "log.globalCommandsCleared":
    "{count} commande(s) globale(s) périmée(s) supprimée(s)",
  "log.commandsSynced": "Commandes de la guild après synchronisation : {names}",
  "log.commandError": "Erreur lors de l'exécution de la commande {name}",
  "log.commandsRegisterError": "Erreur lors de l'enregistrement des commandes",
  "log.rssError": "Erreur RSS ({url})",
  "log.rssCheckStart": "Vérification de {count} flux RSS",
  "log.rssCheckDone": "Vérification des flux terminée",
  "log.feedAdded": "Nouvel article : {title}",
  "log.feedSkipped": "Article ignoré (filtres) : {title}",
  "log.feedSkippedExisting": "Article déjà envoyé : {title}",
  "log.feedPaused": "Flux en pause, ignoré : {url}",
  "log.feedErrorAlert": "Flux en échec après {count} tentatives : {url}",
  "log.feedRecovered": "Le flux fonctionne à nouveau : {url}",
  "log.adminAlertError": "Erreur lors de l'envoi de l'alerte admin",
  "log.webhookError": "Erreur lors de l'envoi au webhook",
  "log.previewError": "Erreur lors de la validation du flux {url}",
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
  "cmd.add.role": "Role to mention when an article is posted",
  "cmd.add.interval":
    "Custom polling frequency in minutes (default: global frequency)",
  "cmd.add.whitelist":
    "Comma-separated keywords: only articles containing one are posted",
  "cmd.add.blacklist":
    "Comma-separated keywords: articles containing one are skipped",
  "cmd.add.webhook":
    "Discord webhook URL: also send the article to this webhook",
  "cmd.add.preview": "**Feed preview**\n📰 {title}\n🔗 {link}\n\nThe latest article will be posted at the next check.\nAdd this feed?",
  "cmd.add.confirm": "Add",
  "cmd.add.cancel": "Cancel",
  "cmd.add.cancelled": "Add cancelled.",
  "cmd.add.success": "✔ Feed added : `{url}` → <#{channel}> (`{id}`)",
  "cmd.add.invalidFeed":
    "❌ Unable to read a feed at this URL. Make sure it is a valid RSS/Atom feed.",
  "cmd.add.webhookInvalid": "❌ The provided webhook URL is not valid.",
  "cmd.add.roleNotMentionable":
    "⚠️ This role is not mentionable: the mention may not work.",

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
  "cmd.list.paused": "⏸ paused",
  "cmd.list.customInterval": "🕒 {min} min",
  "cmd.list.filtered": "🔍 filtered",
  "cmd.list.translated": "🌐",
  "cmd.list.role": "👥 @{role}",

  "cmd.edit.description": "Edit an RSS feed",
  "cmd.edit.id": "Feed ID (see /rss-list)",
  "cmd.edit.translate": "Enable or disable feed translation",
  "cmd.edit.enable": "Enable or pause the feed",
  "cmd.edit.interval": "New polling frequency in minutes (0 = global frequency)",
  "cmd.edit.role": "Role to mention",
  "cmd.edit.removeRole": "Remove the mentioned role",
  "cmd.edit.webhook": "Webhook URL ('off' to remove)",
  "cmd.edit.whitelist":
    "Whitelist keywords ('off' to clear, commas to separate)",
  "cmd.edit.blacklist":
    "Blacklist keywords ('off' to clear, commas to separate)",
  "cmd.edit.invalid": "❌ Invalid ID.",
  "cmd.edit.noChanges": "❌ No field provided to modify.",
  "cmd.edit.success": "✔ Feed `{id}` updated: {changes}",
  "cmd.edit.enabled": "enabled",
  "cmd.edit.disabled": "disabled",
  "cmd.edit.lbl.enabled": "feed enabled",
  "cmd.edit.lbl.disabled": "feed paused",
  "cmd.edit.lbl.translateOn": "translation enabled",
  "cmd.edit.lbl.translateOff": "translation disabled",
  "cmd.edit.lbl.interval": "frequency {min} min",
  "cmd.edit.lbl.intervalGlobal": "global frequency",
  "cmd.edit.lbl.role": "role <@&{id}>",
  "cmd.edit.lbl.roleCleared": "role removed",
  "cmd.edit.lbl.webhook": "webhook set",
  "cmd.edit.lbl.webhookCleared": "webhook removed",
  "cmd.edit.lbl.whitelist": "whitelist: {kw}",
  "cmd.edit.lbl.whitelistCleared": "whitelist cleared",
  "cmd.edit.lbl.blacklist": "blacklist: {kw}",
  "cmd.edit.lbl.blacklistCleared": "blacklist cleared",

  "cmd.stats.description": "RSS bot statistics",
  "cmd.stats.title": "**📊 RSS Statistics**",
  "cmd.stats.feeds": "Feeds: {count} ({active} active)",
  "cmd.stats.posted": "Articles posted: {count}",
  "cmd.stats.lastPost": "Last post: {date}",
  "cmd.stats.failureRate": "Feeds in error: {failed}/{total} ({percent}%)",
  "cmd.stats.never": "never",
  "cmd.stats.justNow": "just now",
  "cmd.stats.minutesAgo": "{n} min ago",
  "cmd.stats.hoursAgo": "{n} h ago",
  "cmd.stats.daysAgo": "{n} d ago",

  "cmd.export.description": "Export RSS feeds to a JSON file",
  "cmd.export.success": "Export of {count} feeds ready.",
  "cmd.import.description": "Import RSS feeds from a JSON file",
  "cmd.import.file": "JSON file to import",
  "cmd.import.success":
    "✔ {added} feed(s) imported, {skipped} skipped (already present).",
  "cmd.import.invalid": "❌ Invalid file: {message}",

  "rss.noTitle": "No title",
  "rss.noDescription": "No description available",
  "rss.openLink": "Open",
  "rss.feedErrorAlert":
    "🚨 The feed `{url}` has been failing for {count} consecutive checks. Check its availability or delete it with /rss-remove.",
  "rss.feedRecovered": "✅ The feed `{url}` is working again.",

  "log.rssDataMissing":
    "rss.json does not exist; it will be created on the first registration.",
  "log.clientReady": "Connected as {username}",
  "log.commandsRegistered": "{count} command(s) registered",
  "log.applicationInfo": "Application connected (ID {id})",
  "log.globalCommandsCleared":
    "Cleared {count} stale global command(s)",
  "log.commandsSynced": "Guild commands after sync: {names}",
  "log.commandError": "Error while executing command {name}",
  "log.commandsRegisterError": "Error while registering commands",
  "log.rssError": "RSS error ({url})",
  "log.rssCheckStart": "Checking {count} RSS feeds",
  "log.rssCheckDone": "Feed check finished",
  "log.feedAdded": "New article: {title}",
  "log.feedSkipped": "Article skipped (filters): {title}",
  "log.feedSkippedExisting": "Article already sent: {title}",
  "log.feedPaused": "Feed paused, skipped: {url}",
  "log.feedErrorAlert": "Feed failing after {count} attempts: {url}",
  "log.feedRecovered": "Feed is working again: {url}",
  "log.adminAlertError": "Error while sending admin alert",
  "log.webhookError": "Error while sending to webhook",
  "log.previewError": "Error while validating feed {url}",
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
