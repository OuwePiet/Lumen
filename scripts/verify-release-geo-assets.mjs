import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const root = join(process.cwd(), "public", "wereldkalender19");
const countries = JSON.parse(readFileSync(join(root, "geo-countries.json"), "utf8"));
let files = 0, bytes = 0;
const missing = [];
for (const country of countries) {
  const dir = join(root, "geo", country);
  const manifest = join(dir, "manifest.json");
  if (!existsSync(manifest)) { missing.push(country + ":manifest"); continue; }
  const data = JSON.parse(readFileSync(manifest, "utf8"));
  if (data.country !== country || !Array.isArray(data.shards)) { missing.push(country + ":invalid"); continue; }
  for (const shard of data.shards) {
    if (!/^(?:[a-z0-9]|other)$/.test(shard)) { missing.push(country + ":shard-name"); continue; }
    const path = join(dir, shard + ".json.gz");
    if (!existsSync(path)) { missing.push(country + ":" + shard); continue; }
    files++; bytes += statSync(path).size;
  }
}
console.log(JSON.stringify({countries:countries.length,shardFiles:files,compressedBytes:bytes,missing:missing.slice(0,20),missingCount:missing.length},null,2));
if (missing.length) process.exitCode = 1;
