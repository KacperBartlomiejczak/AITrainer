ALTER TABLE `workout_session_sets` ADD `is_one_rep_max_record` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `workout_session_sets` ADD `is_best_set_volume_record` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `workout_session_sets` ADD `is_max_reps_record` integer DEFAULT false NOT NULL;--> statement-breakpoint
-- The single legacy PR flag meant "heaviest set", the closest of the new record types is the 1RM
UPDATE `workout_session_sets` SET `is_one_rep_max_record` = `is_personal_record`;--> statement-breakpoint
ALTER TABLE `workout_session_sets` DROP COLUMN `is_personal_record`;