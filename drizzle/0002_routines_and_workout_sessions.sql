CREATE TABLE `routine_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_id` text NOT NULL,
	`position` integer NOT NULL,
	`name` text NOT NULL,
	`target_muscle` text NOT NULL,
	`sets` integer NOT NULL,
	`target_reps` text NOT NULL,
	`rest_seconds` integer NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `routine_exercises_routine_position_idx` ON `routine_exercises` (`routine_id`,`position`);--> statement-breakpoint
CREATE TABLE `routines` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`level` text NOT NULL,
	`days_per_week` integer NOT NULL,
	`duration_minutes` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_session_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`position` integer NOT NULL,
	`name` text NOT NULL,
	`target_muscle` text NOT NULL,
	`sets` integer NOT NULL,
	`target_reps` text NOT NULL,
	`completed` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `workout_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workout_session_exercises_session_position_idx` ON `workout_session_exercises` (`session_id`,`position`);--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`routine_id` text,
	`title` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer NOT NULL,
	`duration_seconds` integer NOT NULL,
	`photo_file_name` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `workout_sessions_user_completed_idx` ON `workout_sessions` (`user_id`,`completed_at`);