CREATE TABLE `workout_session_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`session_exercise_id` text NOT NULL,
	`position` integer NOT NULL,
	`weight_kg` real NOT NULL,
	`reps` integer NOT NULL,
	`tag` text,
	`is_personal_record` integer NOT NULL,
	FOREIGN KEY (`session_exercise_id`) REFERENCES `workout_session_exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workout_session_sets_exercise_position_idx` ON `workout_session_sets` (`session_exercise_id`,`position`);--> statement-breakpoint
ALTER TABLE `workout_session_exercises` ADD `catalog_exercise_id` text;