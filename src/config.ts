import fs from "fs";
import type { Config } from "./types.js";
import { resolveProjectFile } from "./utils/paths.js";

const configPath = resolveProjectFile("config.json");
export const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as Config;
