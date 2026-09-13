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

describe("drizzle migration 0002 (routines & workout sessions)", () => {
  it("keeps an existing profile and adds the new tables", () => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    const db = drizzle(sqlite);
    const previousFolder = createPartialMigrationsFolder(2);

    try {
      migrate(db, { migrationsFolder: previousFolder });
      sqlite
        .prepare(
          "INSERT INTO user_profiles VALUES ('local', 'Kacper', 'beginner', 'strength', 'undecided', 1, 1, 1)",
        )
        .run();

      migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM user_profiles").get()).toEqual({ count: 1 });
      const tables = sqlite
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((table) => (table as { name: string }).name);
      expect(tables).toEqual(
        expect.arrayContaining([
          "routines",
          "routine_exercises",
          "workout_sessions",
          "workout_session_exercises",
        ]),
      );
    } finally {
      sqlite.close();
      fs.rmSync(previousFolder, { recursive: true, force: true });
    }
  });
});

describe("drizzle migration 0003 (workout session sets)", () => {
  it("keeps saved workouts (without a catalog id) and adds the sets table", () => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    const db = drizzle(sqlite);
    const previousFolder = createPartialMigrationsFolder(3);

    try {
      migrate(db, { migrationsFolder: previousFolder });
      sqlite
        .prepare(
          "INSERT INTO user_profiles VALUES ('local', 'Kacper', 'beginner', 'strength', 'undecided', 1, 1, 1)",
        )
        .run();
      sqlite
        .prepare("INSERT INTO workout_sessions VALUES ('wks_1', 'local', NULL, 'FBW', 1, 2, 1, NULL, 2)")
        .run();
      sqlite
        .prepare("INSERT INTO workout_session_exercises VALUES ('wse_1', 'wks_1', 0, 'Przysiad', 'Nogi', 3, '8', 1)")
        .run();

      migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

      expect(
        sqlite.prepare("SELECT id, catalog_exercise_id FROM workout_session_exercises").all(),
      ).toEqual([{ id: "wse_1", catalog_exercise_id: null }]);

      sqlite
        .prepare(
          "INSERT INTO workout_session_sets (id, session_exercise_id, position, weight_kg, reps, tag) VALUES ('wss_1', 'wse_1', 0, 62.5, 8, 'warmup')",
        )
        .run();
      sqlite.prepare("DELETE FROM workout_sessions WHERE id = 'wks_1'").run();
      // Sets are removed together with their workout (data deletion on request)
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM workout_session_sets").get()).toEqual({ count: 0 });
    } finally {
      sqlite.close();
      fs.rmSync(previousFolder, { recursive: true, force: true });
    }
  });
});

describe("drizzle migration 0004 (personal record types)", () => {
  it("keeps logged sets, maps the old PR flag to the 1RM record and drops the legacy column", () => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    const db = drizzle(sqlite);
    const previousFolder = createPartialMigrationsFolder(4);

    try {
      migrate(db, { migrationsFolder: previousFolder });
      sqlite
        .prepare("INSERT INTO user_profiles VALUES ('local', 'Kacper', 'beginner', 'strength', 'undecided', 1, 1, 1)")
        .run();
      sqlite.prepare("INSERT INTO workout_sessions VALUES ('wks_1', 'local', NULL, 'Push', 1, 2, 1, NULL, 2)").run();
      sqlite
        .prepare(
          "INSERT INTO workout_session_exercises (id, session_id, position, name, target_muscle, sets, target_reps, completed, catalog_exercise_id) VALUES ('wse_1', 'wks_1', 0, 'Wyciskanie', 'Klatka', 2, '5', 1, '0025')",
        )
        .run();
      sqlite
        .prepare(
          "INSERT INTO workout_session_sets (id, session_exercise_id, position, weight_kg, reps, tag, is_personal_record) VALUES ('wss_1', 'wse_1', 0, 60, 10, NULL, 0), ('wss_2', 'wse_1', 1, 80, 5, NULL, 1)",
        )
        .run();

      migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

      expect(
        sqlite
          .prepare(
            "SELECT id, is_one_rep_max_record, is_best_set_volume_record, is_max_reps_record FROM workout_session_sets ORDER BY position",
          )
          .all(),
      ).toEqual([
        { id: "wss_1", is_one_rep_max_record: 0, is_best_set_volume_record: 0, is_max_reps_record: 0 },
        { id: "wss_2", is_one_rep_max_record: 1, is_best_set_volume_record: 0, is_max_reps_record: 0 },
      ]);
      const columns = sqlite
        .prepare("PRAGMA table_info(workout_session_sets)")
        .all()
        .map((column) => (column as { name: string }).name);
      expect(columns).not.toContain("is_personal_record");

      // Sets still belong to their workout (cascade delete keeps working)
      sqlite.prepare("DELETE FROM workout_sessions WHERE id = 'wks_1'").run();
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM workout_session_sets").get()).toEqual({ count: 0 });
    } finally {
      sqlite.close();
      fs.rmSync(previousFolder, { recursive: true, force: true });
    }
  });
});
