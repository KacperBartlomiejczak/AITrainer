-- Legacy profiles have no experience level. Instead of inventing a default,
-- they are removed and the user completes the (now longer) onboarding again.
-- SQLite cannot ADD a NOT NULL column without a default, so both tables are recreated.
DROP TABLE `user_focus_muscle_groups`;--> statement-breakpoint
DROP TABLE `user_profiles`;--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`experience_level` text NOT NULL,
	`fitness_goal` text NOT NULL,
	`muscle_focus_mode` text NOT NULL,
	`onboarding_completed_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);--> statement-breakpoint
CREATE TABLE `user_focus_muscle_groups` (
	`user_id` text NOT NULL,
	`muscle_group` text NOT NULL,
	PRIMARY KEY(`user_id`, `muscle_group`),
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
