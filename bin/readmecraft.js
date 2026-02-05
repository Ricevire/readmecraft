#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import inquirer from "inquirer";
import { generateReadme } from "../lib/generator.js";
import { readPackageJson } from "../lib/pkg.js";
import { readConfigJson } from "../lib/config.js";

function safeWriteFile(filePath, content, { force = false } = {}) {
  if (fs.existsSync(filePath) && !force) {
    throw new Error(
      `File already exists: ${filePath}\nUse --force to overwrite.`
    );
  }
  fs.writeFileSync(filePath, content, "utf8");
}

function parseArgs(argv) {
  const args = argv.slice(2);

  const out = (() => {
    const idx = args.indexOf("--out");
    if (idx !== -1 && args[idx + 1]) return args[idx + 1];
    return null;
  })();

  const config = (() => {
    const idx = args.indexOf("--config");
    if (idx !== -1 && args[idx + 1]) return args[idx + 1];
    return null;
  })();

  const lang = args.includes("--zh") ? "zh" : args.includes("--en") ? "en" : null;

  return {
    force: args.includes("--force") || args.includes("-f"),
    noPrompt: args.includes("--no-prompt"),
    out,
    config,
    lang,
  };
}

async function main() {
  const { force, noPrompt, out, config, lang } = parseArgs(process.argv);
  const cwd = process.cwd();

  // defaults from package.json
  const pkg = readPackageJson(cwd) || {};
  const baseDefaults = {
    projectName: pkg.name || path.basename(cwd),
    description:
      pkg.description ||
      "A lightweight CLI tool to generate clean, structured README files.",
    features: ["Fast", "Lightweight", "No config", "Clean template"],
    install: "npm i -g readmecraft",
    usage: "readmecraft --out README.md",
    license: pkg.license || "MIT",
    lang: "en",
    out: "README.md",
  };

  // defaults overridden by config (if any)
  const cfg = readConfigJson(config, cwd) || {};
  const defaults = {
    ...baseDefaults,
    ...cfg,
    // features 需要保留数组，不要被 spread 搞坏（cfg.features 本来就是数组）
    features: cfg.features ?? baseDefaults.features,
  };

  // CLI flags override config
  const finalLang = lang || defaults.lang || "en";
  const finalOut = out || defaults.out || "README.md";

  let answers;

  if (noPrompt) {
    answers = {
      projectName: defaults.projectName,
      description: defaults.description,
      features: defaults.features,
      install: defaults.install,
      usage: defaults.usage,
      license: defaults.license,
    };
  } else {
    answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Project name:",
        default: defaults.projectName,
        validate: (v) => (v?.trim() ? true : "Project name is required."),
      },
      {
        type: "input",
        name: "description",
        message: "Short description:",
        default: defaults.description,
      },
      {
        type: "input",
        name: "features",
        message: "Key features (comma separated):",
        default: (defaults.features || []).join(", "),
        filter: (v) =>
          String(v)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      },
      {
        type: "input",
        name: "install",
        message: "Install command:",
        default: defaults.install,
      },
      {
        type: "input",
        name: "usage",
        message: "Usage example:",
        default: defaults.usage,
      },
      {
        type: "input",
        name: "license",
        message: "License:",
        default: defaults.license,
      },
    ]);
  }

  const readme = generateReadme({
    ...answers,
    lang: finalLang,
  });

  const outPath = path.resolve(cwd, finalOut);
  safeWriteFile(outPath, readme, { force });

  console.log(`✅ README generated: ${outPath}`);
  console.log(
    `   Mode: ${noPrompt ? "no-prompt" : "interactive"} | Lang: ${finalLang.toUpperCase()}`
  );
  if (config) console.log(`   Config: ${config}`);
}

main().catch((err) => {
  console.error("❌ ReadmeCraft failed:");
  console.error(err?.message || err);
  process.exit(1);
});
