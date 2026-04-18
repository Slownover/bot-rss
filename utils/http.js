const axios = require("axios");
const { default: CacheableLookup } = require("cacheable-lookup");
const http = require("http");
const https = require("https");

// DNS cache
const cacheable = new CacheableLookup();

const httpAgent = new http.Agent();
const httpsAgent = new https.Agent();

cacheable.install(httpAgent);
cacheable.install(httpsAgent);

const client = axios.create({
  timeout: 7000,
  httpAgent,
  httpsAgent,
  maxRedirects: 5,
  headers: {
    Accept: "*/*",
  },
});

module.exports = { http: client };
