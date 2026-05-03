#!/usr/bin/env node
// Tear down what dev-register.mjs set up: deregister the Claude Code MCP server
// and restore the registry version of @utcp/code-mode (overwrites the local
// dist/ overlay).
//
// Usage:
//   node scripts/dev-unregister.mjs [--name <mcp-name>]

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bridgeDir = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const getArg = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const name = getArg("--name", "utcp-codemode-dev");

function run(cmd, args, opts = {}) {
  console.log(`> ${cmd} ${args.join(" ")}  (in ${opts.cwd ?? process.cwd()})`);
  spawnSync(cmd, args, { stdio: "inherit", shell: true, ...opts });
}

run("claude", ["mcp", "remove", name, "--scope", "user"]);
// Reinstall @utcp/code-mode from the registry, undoing the dev-register dist
// overlay. --no-save keeps package.json untouched.
run("npm", ["install", "@utcp/code-mode", "--no-save"], { cwd: bridgeDir });

console.log(`\n✓ Unregistered '${name}' and restored registry @utcp/code-mode.`);
console.log(`  Restart Claude Code so it stops trying to spawn the dev bridge.`);
