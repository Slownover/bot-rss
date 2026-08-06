import axios from "axios";
import CacheableLookup from "cacheable-lookup";
import httpModule from "http";
import httpsModule from "https";

const cacheable = new CacheableLookup();

const httpAgent = new httpModule.Agent();
const httpsAgent = new httpsModule.Agent();

cacheable.install(httpAgent);
cacheable.install(httpsAgent);

export const http = axios.create({
  timeout: 7000,
  httpAgent,
  httpsAgent,
  maxRedirects: 5,
  headers: {
    Accept: "*/*",
  },
});
