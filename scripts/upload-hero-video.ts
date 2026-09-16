/**
 * Uploads a hero background video + poster image to Sanity and sets them
 * on the homePage singleton's hero.video/hero.poster fields. Reusable —
 * run again with new files to replace the current background video.
 *
 *   npx sanity exec scripts/upload-hero-video.ts --with-user-token -- \
 *     --video="C:\path\to\video.mp4" --poster="C:\path\to\poster.jpg" --alt="Description of the poster image"
 */
import { createReadStream } from "node:fs";
import { getCliClient } from "sanity/cli";

const client = getCliClient();

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found?.slice(prefix.length);
}

async function run() {
  const videoPath = arg("video");
  const posterPath = arg("poster");
  const alt = arg("alt") ?? "ESF hero background video still";

  if (!videoPath || !posterPath) {
    console.error(
      'Usage: sanity exec scripts/upload-hero-video.ts --with-user-token -- --video="path.mp4" --poster="path.jpg" [--alt="..."]',
    );
    process.exit(1);
  }

  console.log("Uploading video...");
  const videoAsset = await client.assets.upload("file", createReadStream(videoPath), {
    filename: "hero-background.mp4",
    contentType: "video/mp4",
  });

  console.log("Uploading poster image...");
  const imageAsset = await client.assets.upload("image", createReadStream(posterPath), {
    filename: "hero-poster.jpg",
  });

  await client
    .patch("homePage")
    .set({
      "hero.video": { _type: "file", asset: { _type: "reference", _ref: videoAsset._id } },
      "hero.poster": {
        _type: "imageWithAlt",
        alt,
        asset: { _type: "reference", _ref: imageAsset._id },
      },
    })
    .commit();

  console.log("Done — homePage.hero.video and hero.poster updated.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
