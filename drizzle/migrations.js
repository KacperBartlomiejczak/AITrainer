// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_init_onboarding.sql';
import m0001 from './0001_experience_level_and_muscle_focus.sql';
import m0002 from './0002_routines_and_workout_sessions.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002
    }
  }
  