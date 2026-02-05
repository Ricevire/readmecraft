import fs from "node:fs";
import path from "node:path";

export function readConfigJson(configPath, cwd) {
  if (!configPath) return null;

  const abs = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(cwd, configPath);

  if (!fs.existsSync(abs)) {
    throw new Error(`Config file not found: ${abs}`);
  }

  let obj;
  try {
    obj = JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch {
    throw new Error(`Invalid JSON in config: ${abs}`);
  }

  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error(`Config must be a JSON object: ${abs}`);
  }

  // 只允许这些字段，避免用户写错还悄悄不生效
  const allowed = new Set([
    "projectName",
    "description",
    "features",
    "install",
    "usage",
    "license",
    "lang",
    "out",
  ]);

  for (const k of Object.keys(obj)) {
    if (!allowed.has(k)) {
      throw new Error(
        `Unknown config field "${k}". Allowed: ${Array.from(allowed).join(", ")}`
      );
    }
  }

  if (obj.features && !Array.isArray(obj.features)) {
    throw new Error(`"features" must be an array of strings.`);
  }

  if (obj.lang && obj.lang !== "en" && obj.lang !== "zh") {
    throw new Error(`"lang" must be "en" or "zh".`);
  }

  return obj;
}
