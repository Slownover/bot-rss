import Parser from "rss-parser";

export type CustomItem = {
  mediaContent?: { $: { url?: string } }[];
  mediaThumbnail?: { $: { url?: string } }[];
};

export type ParsedFeed = Parser.Output<CustomItem>;

const parser = new Parser<Record<string, unknown>, CustomItem>({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
    ],
  },
});

export async function parseFeedWithRetry(
  url: string,
  retries = 3,
): Promise<ParsedFeed> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await parser.parseURL(url);
    } catch (err) {
      lastErr = err;
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }
  }
  throw lastErr;
}

export async function fetchLatestItem(
  url: string,
): Promise<{ title: string | undefined; link: string | undefined } | null> {
  try {
    const parsed = await parseFeedWithRetry(url);
    const item = parsed.items[0];
    if (!item) return { title: undefined, link: undefined };
    return { title: item.title, link: item.link };
  } catch {
    return null;
  }
}
