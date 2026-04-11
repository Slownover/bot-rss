const config = require("./config.json"); // ta clé API dedans

async function translate(text, sourceLang = "en", targetLang = "fr") {
  const url =
    "https://translate-pa.googleapis.com/v1/translate?" +
    new URLSearchParams({
      "params.client": "gtx",
      dataTypes: "TRANSLATION",
      key: config.googleApiKey,
      "query.sourceLanguage": sourceLang,
      "query.targetLanguage": targetLang,
      "query.text": text,
    });

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data?.translation) {
      return data.translation;
    }

    console.error("Erreur API Google :", data);
    return text;
  } catch (err) {
    console.error("Erreur traduction :", err);
    return text;
  }
}

module.exports = translate;
