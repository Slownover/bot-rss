import crypto from "crypto";
import type { Feed } from "../types.js";
import { MAX_SENT_HISTORY, rssData } from "../utils/function.js";

/** Step applied to each title word on a vote. */
const WORD_STEP = 0.25;
/** Step applied to the source (feed) on a vote. */
const SOURCE_STEP = 0.5;
/** Learned weights are clamped to [-MAX_LEARNED_WEIGHT, MAX_LEARNED_WEIGHT]. */
const MAX_LEARNED_WEIGHT = 3;
/** Upper bound on learned words kept in rss.json (weakest are pruned). */
const MAX_LEARNED_WORDS = 2000;
const MIN_WORD_LENGTH = 4;

const STOPWORDS = new Set([
  // fr
  "avec", "dans", "pour", "sans", "sous", "vers", "chez", "mais", "donc",
  "sont", "cette", "elle", "elles", "nous", "vous", "leur", "leurs", "tout",
  "tous", "toute", "toutes", "plus", "moins", "tres", "comme", "quand",
  "alors", "aussi", "fait", "faire", "peut", "etre", "avoir", "apres",
  "avant", "depuis", "entre", "encore", "deja", "selon", "voici", "votre",
  "notre", "quoi", "dont", "ainsi", "cela", "ceci", "celui", "celle",
  // en
  "this", "that", "with", "from", "have", "your", "what", "when", "will",
  "just", "into", "about", "more", "than", "they", "their", "there", "been",
  "were", "which", "would", "could", "should", "after", "before", "over",
  "here", "these", "those", "some", "only", "also", "most", "very", "does",
  "make", "made", "back", "even", "best", "much", "many", "while", "where",
]);

/** Lowercases, strips accents and splits into alphanumeric tokens. */
export function tokenize(text: string | undefined | null): string[] {
  if (!text) return [];
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** Normalized form used as key for manual keywords ("" if nothing usable). */
export function normalizeKeyword(keyword: string): string {
  return tokenize(keyword).join(" ");
}

function learnableWords(title: string | undefined | null): string[] {
  const words = tokenize(title).filter(
    (w) => w.length >= MIN_WORD_LENGTH && !STOPWORDS.has(w) && !/^\d+$/.test(w),
  );
  return [...new Set(words)];
}

function containsPhrase(haystack: string, phrase: string): boolean {
  return haystack.includes(` ${phrase} `);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Interest score of an article. 0 when no interest profile is configured,
 * so default behavior is unchanged.
 */
export function scoreArticle(
  feed: Feed,
  title: string | undefined,
  description: string | undefined,
): number {
  const { keywords, learned, sources } = rssData.interests;
  const titleText = ` ${tokenize(title).join(" ")} `;
  const descText = ` ${tokenize(description).join(" ")} `;

  let score = 0;

  for (const [keyword, weight] of Object.entries(keywords)) {
    if (containsPhrase(titleText, keyword)) score += weight * 2;
    else if (containsPhrase(descText, keyword)) score += weight;
  }

  for (const word of learnableWords(title)) {
    score += learned[word] ?? 0;
  }

  score += sources[feed.id] ?? 0;

  return round(score);
}

/** Short stable ID for an article link, usable inside a button customId. */
export function articleKey(link: string): string {
  return crypto.createHash("sha1").update(link).digest("base64url").slice(0, 10);
}

/** Remembers a posted article so votes on it can be applied later. */
export function recordArticle(key: string, feedId: string, title: string): void {
  rssData.articles[key] = { feedId, title, voters: {} };
  const keys = Object.keys(rssData.articles);
  for (let i = 0; i < keys.length - MAX_SENT_HISTORY; i++) {
    delete rssData.articles[keys[i]];
  }
}

function adjust(map: Record<string, number>, key: string, delta: number): void {
  const next = round(
    Math.max(
      -MAX_LEARNED_WEIGHT,
      Math.min(MAX_LEARNED_WEIGHT, (map[key] ?? 0) + delta),
    ),
  );
  if (next === 0) delete map[key];
  else map[key] = next;
}

function pruneLearned(): void {
  const learned = rssData.interests.learned;
  const entries = Object.entries(learned);
  if (entries.length <= MAX_LEARNED_WORDS) return;
  entries
    .sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]))
    .slice(0, entries.length - MAX_LEARNED_WORDS)
    .forEach(([word]) => delete learned[word]);
}

function applyDelta(feedId: string, title: string, direction: number): void {
  const { learned, sources } = rssData.interests;
  adjust(sources, feedId, SOURCE_STEP * direction);
  for (const word of learnableWords(title)) {
    adjust(learned, word, WORD_STEP * direction);
  }
}

export type VoteResult = "recorded" | "changed" | "unchanged" | "unknown";

/**
 * Applies a user's vote on an article. A user has a single vote per article:
 * switching sides reverts the previous adjustment first.
 */
export function applyVote(
  key: string,
  userId: string,
  direction: 1 | -1,
): VoteResult {
  const meta = rssData.articles[key];
  if (!meta) return "unknown";

  const previous = meta.voters[userId];
  if (previous === direction) return "unchanged";

  if (previous) applyDelta(meta.feedId, meta.title, -previous);
  applyDelta(meta.feedId, meta.title, direction);
  meta.voters[userId] = direction;
  pruneLearned();

  return previous ? "changed" : "recorded";
}
