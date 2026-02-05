#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import inquirer from "inquirer";
import { generateReadme } from "../lib/generator.js";
import { readPackageJson } from "../lib/pkg.js";

/**
 * 安全写文件：默认不覆盖
 */
function safeWriteFile(filePath, content, { force = false } = {}) {
  if (fs.existsSync(filePath) && !force) {
    throw new Error(
      `File already exists: ${filePath}\nUse --force to overwrite.`
    );
  }
  fs.writeFileSync(filePath, content, "utf8");
}

/**
 * 解析 CLI 参数
 */
function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    force: args.includes("--force") || args.includes("-f"),
    noPrompt: args.includes("--no-prompt"),
    lang: args.includes("--zh") ? "zh" : "en",
    out: (() => {
      const idx = args.indexOf("--out");
      if (idx !== -1 && args[idx + 1]) return args[idx + 1];
      return "README.md";
    })(),
  };
}

async function main() {
  const { force, noPrompt, lang, out } = parseArgs(process.argv);
  const cwd = process.cwd();

  // 👉 自动读取 package.json
  const pkg = readPackageJson(cwd) || {};

  const defaults = {
    projectName: pkg.name || path.basename(cwd),
    description:
      pkg.description ||
      "A lightweight CLI tool to generate a clean, structured README.",
    features: ["Fast", "Lightweight", "No config", "Clean template"],
    install: "npm i -g readmecraft",
    usage: "readmecraft --out README.md",
    license: pkg.license || "MIT",
  };

  let answers;

  if (noPrompt) {
    // ✅ 无交互模式
    answers = defaults;
  } else {
    // ✅ 交互模式
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
        default: defaults.features.join(", "),
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
    lang,
  });

  const outPath = path.resolve(cwd, out);
  safeWriteFile(outPath, readme, { force });

  console.log(`✅ README generated: ${outPath}`);
  console.log(
    `   Mode: ${noPrompt ? "no-prompt" : "interactive"} | Language: ${lang.toUpperCase()}`
  );
}

main().catch((err) => {
  console.error("❌ ReadmeCraft failed:");
  console.error(err?.message || err);
  process.exit(1);
});
