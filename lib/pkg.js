import fs from "node:fs";
import path from "node:path";

export function readPackageJson(cwd) {
  try {
    const pkgPath = path.join(cwd, "package.json");
    if (!fs.existsSync(pkgPath)) return null;

    const raw = fs.readFileSync(pkgPath, "utf8");
    const pkg = JSON.parse(raw);

    return {
      name: typeof pkg.name === "string" ? pkg.name : null,
      description: typeof pkg.description === "string" ? pkg.description : null,
      license: typeof pkg.license === "string" ? pkg.license : null,
    };
  } catch {
    return null;
  }
}
