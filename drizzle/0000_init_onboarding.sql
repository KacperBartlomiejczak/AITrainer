CREATE TABLE `user_focus_muscle_groups` (
	`user_id` text NOT NULL,
	`muscle_group` text NOT NULL,
	PRIMARY KEY(`user_id`, `muscle_group`),
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`fitness_goal` text NOT NULL,
	`onboarding_completed_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
