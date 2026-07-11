import { renderSurfaces } from "../packages/ui/src/render-surfaces.mjs";

async function main() {
  await renderSurfaces();
  console.log("WGOS dashboard surfaces generated.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
