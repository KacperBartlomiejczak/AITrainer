import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "fs";
import os from "os";
import path from "path";

const MIGRATIONS_FOLDER = path.join(__dirname, "../../../drizzle");

interface JournalEntry {
  idx: number;
  tag: string;
}

/** Copy of the migrations folder that only contains the first `count` migrations. */
function createPartialMigrationsFolder(count: number): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aitrainer-migrations-"));
  fs.mkdirSync(path.join(dir, "meta"));

  const journalPath = path.join(MIGRATIONS_FOLDER, "meta/_journal.json");
  const journal = JSON.parse(fs.readFileSync(journalPath, "utf8")) as { entries: JournalEntry[] };
  const entries = journal.entries.slice(0, count);

  fs.writeFileSync(path.join(dir, "meta/_journal.json"), JSON.stringify({ ...journal, entries }));
  for (const entry of entries) {
    fs.copyFileSync(path.join(MIGRATIONS_FOLDER, `${entry.tag}.sql`), path.join(dir, `${entry.tag}.sql`));
  }
  return dir;
}

describe("drizzle migrations", () => {
  it("0001 upgrades a database with a legacy profile by removing it (user re-does onboarding)", () => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    const db = drizzle(sqlite);
    const legacyFolder = createPartialMigrationsFolder(1);

    try {
      migrate(db, { migrationsFolder: legacyFolder });
      sqlite
        .prepare(
          "INSERT INTO user_profiles (id, name, fitness_goal, onboarding_completed_at, created_at, updated_at) VALUES ('local', 'Kacper', 'strength', 1, 1, 1)",
        )
        .run();
      sqlite.prepare("INSERT INTO user_focus_muscle_groups VALUES ('local', 'chest')").run();

      migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM user_profiles").get()).toEqual({ count: 0 });
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM user_focus_muscle_groups").get()).toEqual({
        count: 0,
      });
      const columns = sqlite
        .prepare("PRAGMA table_info(user_profiles)")
        .all()
        .map((column) => (column as { name: string }).name);
      expect(columns).toEqual(
        expect.arrayContaining(["experience_level", "muscle_focus_mode"]),
      );
    } finally {
      sqlite.close();
      fs.rmSync(legacyFolder, { recursive: true, force: true });
    }
  });
});
