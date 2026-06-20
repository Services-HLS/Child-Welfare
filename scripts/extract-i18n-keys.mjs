import fs from "fs";
const s = fs.readFileSync("src/lib/i18n.ts", "utf8");
const m = s.match(/const en = \{([\s\S]*?)\} as const/);
const keys = [...m[1].matchAll(/^\s+(\w+):/gm)].map((x) => x[1]);
fs.writeFileSync("src/lib/i18n/en-keys.json", JSON.stringify(keys, null, 2));
