import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(projectRoot, "assets");

const images = [
  "Logo.jpeg", "banner.jpeg", "aaaaa.jpeg",
  "WhatsApp Image 2026-09-17 at 11.21.37 PM.jpeg",
  "WhatsApp Image 2026-09-17 at 11.34.11 PM.jpeg",
  "WhatsApp Image 2026-09-17 at 11.34.12 PM.jpeg",
  "WhatsApp Image 2026-09-17 at 11.34.13 PM.jpeg",
  "WhatsApp Image 2026-09-17 at 11.34.14 PM.jpeg",
  "WhatsApp Image 2026-09-17 at 11.35.37 PM.jpeg",
  "WhatsApp Image 2026-09-17 at 11.35.37 PMd.jpeg",
  "WhatsApp Image 2026-09-17 at 11.35.41 PM.jpeg",
  "WhatsApp Image 2026-09-17 at 11.35.41 PMa.jpeg",
  "WhatsApp Image 2026-09-17 at 11.35.41 PMb.jpeg",
  "WhatsApp Image 2026-09-17 at 11.35.41 PMg.jpeg",
  "WhatsApp Image 2026-09-17 at 11.35.42 PMa.jpeg",
  "WhatsApp Image 2026-09-17 at 11.36.17 PMa.jpeg",
  "WhatsApp Image 2026-09-17 at 11.36.17 PMc.jpeg",
  "WhatsApp Image 2026-09-17 at 11.36.38 PM.jpeg",
  "WhatsApp Image 2026-09-17 at 11.36.55 PM.jpeg",
  "WhatsApp Image 2026-09-17 at 11.38.05 PM.jpeg"
];

for (const filename of images) {
  const input = path.join(assets, filename);
  const output = path.join(assets, `${path.parse(filename).name}.webp`);
  await sharp(input)
    .rotate()
    .resize({ width: filename === "Logo.jpeg" ? 900 : 1600, withoutEnlargement: true })
    .webp({ quality: filename === "Logo.jpeg" ? 86 : 80, effort: 6, smartSubsample: true })
    .toFile(output);
  console.log(`${filename} -> ${path.basename(output)}`);
}
