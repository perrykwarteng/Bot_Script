import * as esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.resolve(root, "../../public");

async function main() {
  const watch = process.argv.includes("--watch");

  const ctx = await esbuild.context({
    entryPoints: [path.join(root, "src/widget.ts")],
    outfile: path.join(outDir, "widget.js"),
    bundle: true,
    minify: true,
    format: "iife",
    target: "es2020",
    sourcemap: false,
  });

  if (watch) {
    console.log("[widget] watching for changes...");
    await ctx.watch();
  } else {
    await ctx.rebuild();
    console.log("[widget] built -> public/widget.js");
    await ctx.dispose();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
