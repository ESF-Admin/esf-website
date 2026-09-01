/**
 * One-time migration: pushes the 33 bulletins originally hand-sourced from
 * esfworld.us/bulletin into Sanity as `bulletin` documents (no file attached
 * yet — the admin uploads each .docx afterward from /studio).
 *
 * Run with the Sanity CLI, which handles env vars and an authenticated
 * write token automatically:
 *
 *   npx sanity exec scripts/seed-bulletins.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

type Seed = { date: string; title: string; scripture?: string };

const entries: Seed[] = [
  { date: "2026-01-04", title: "A New Heart for a New Year", scripture: "Ezekiel 36:26–27" },
  { date: "2026-01-11", title: "New Strength for the Journey Ahead", scripture: "Isaiah 40:28–31" },
  { date: "2026-01-18", title: "New Growth Through God's Word", scripture: "Psalm 1:1–3" },
  { date: "2026-01-25", title: "Fresh Fire, Fresh Spirit", scripture: "2 Timothy 1:6–7" },
  { date: "2026-02-01", title: "Victory Through Faith in Almighty God", scripture: "1 Samuel 17:45–47" },
  { date: "2026-02-08", title: "Victory Through the Power of God's Spirit", scripture: "Zechariah 4:6–10" },
  { date: "2026-02-15", title: "Victory Through the Cross", scripture: "Colossians 2:13–15" },
  { date: "2026-02-22", title: "Final Victory Through God's Unshakable Kingdom", scripture: "Romans 8:31–39" },
  { date: "2026-03-01", title: "Hope in the Season of Spring", scripture: "Song of Songs 2:10–13" },
  { date: "2026-03-08", title: "Should I serve God, or should God serve me?", scripture: "1 Timothy 1:12–17" },
  { date: "2026-03-15", title: "The Power of God's Word", scripture: "Ezekiel 37:1–14" },
  { date: "2026-03-22", title: "Called to Heal", scripture: "John 8:3–11" },
  { date: "2026-03-29", title: "Presentation of the King", scripture: "Matthew 21:1–11" },
  { date: "2026-04-05", title: "What the Resurrection Brings to Our Lives", scripture: "Luke 24:36–49" },
  { date: "2026-04-12", title: "The Authority of Jesus Christ", scripture: "Mark 1:21–28" },
  { date: "2026-04-19", title: "The Call to Follow Jesus", scripture: "Mark 8:34–38" },
  { date: "2026-04-26", title: "The Servant Who Gives His Life", scripture: "Mark 10:42–45" },
  { date: "2026-05-03", title: "The Lord of Hope", scripture: "Luke 7:11–17" },
  { date: "2026-05-10", title: "How To Pray Effectively", scripture: "1 Samuel 1:10–20" },
  { date: "2026-05-17", title: "A 38-Year-Old Invalid", scripture: "John 5:1–9" },
  { date: "2026-05-24", title: "All Things Are Possible with God", scripture: "Mark 10:17–27" },
  { date: "2026-05-31", title: "The Treasure in Jars of Clay", scripture: "2 Corinthians 4:7–18" },
  { date: "2026-06-07", title: "Peace in the Middle of the Storm", scripture: "John 6:16–21" },
  { date: "2026-06-14", title: "Finding God's Will", scripture: "Proverbs 3:5–6" },
  { date: "2026-06-21", title: "Faith Beyond What We Can See", scripture: "John 4:46–54" },
  { date: "2026-06-28", title: "Why Must We Pray Even When God Does Not Answer", scripture: "Luke 18:1–8" },
  { date: "2026-07-05", title: "A Winning Spirit", scripture: "2 Corinthians 2:12–17" },
  { date: "2026-07-12", title: "Faith that Overcomes Crisis", scripture: "2 Kings 7:1–7" },
  { date: "2026-07-19", title: "How To Be a Person after God's Own Heart", scripture: "1 Chronicles 28:9" },
  { date: "2026-07-26", title: "God's Kingdom in a Mustard Seed", scripture: "Matthew 13:31–32" },
  { date: "2026-08-02", title: "Called to Shine", scripture: "1 Peter 2:9–12" },
  { date: "2026-08-09", title: "The Only Bread That Satisfies", scripture: "John 6:25–35" },
  { date: "2026-08-16", title: "Coming soon" },
];

async function run() {
  const tx = client.transaction();

  for (const entry of entries) {
    // Deterministic id from the date so re-running this script is a no-op
    // (createIfNotExists) instead of creating duplicates.
    tx.createIfNotExists({
      _id: `bulletin-en-${entry.date}`,
      _type: "bulletin",
      locale: "en",
      ...entry,
    });
  }

  const result = await tx.commit();
  console.log(`Seeded ${entries.length} bulletins.`, result);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
