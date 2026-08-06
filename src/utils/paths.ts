import fs from "fs";
import path from "path";

export function resolveProjectFile(filename: string): string {
  const candidates = [
    path.resolve(process.cwd(), filename),
    path.resolve(__dirname, "..", "..", filename),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? candidates[0];
}
