const config = require("./config.json");

async function translate(text, targetLang = "fr", sourceLang = "auto") {
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
    new URLSearchParams(params);

  try {
    const res = await fetch(url);
    const data = await res.json();

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

module.exports = translate;
