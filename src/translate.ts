import { config } from "./config.js";

export async function translate(
  text: unknown,
  targetLang = "fr",
  sourceLang = "auto",
): Promise<string> {
  if (typeof text !== "string" || !text.trim()) return "";

  const params = {
    "params.client": "gtx",
    dataTypes: "TRANSLATION",
    key: config.googleApiKey,
    "query.sourceLanguage": sourceLang,
    "query.targetLanguage": targetLang,
    "query.text": text,
  };

  const url =
    "https://translate-pa.googleapis.com/v1/translate?" +
    new URLSearchParams(params).toString();

  try {
    const res = await fetch(url);
    const data = (await res.json()) as { translation?: string };

    if (data?.translation) {
      return data.translation;
    }

    console.error("Error Google API :", data);
    return text;
  } catch (err) {
    console.error("Error translation :", err);
    return text;
  }
}
