CREATE TABLE `news` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`label` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`published_at` text NOT NULL,
	`image` text,
	`href` text DEFAULT '/noticias' NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transfers` (
	`id` text PRIMARY KEY NOT NULL,
	`player` text NOT NULL,
	`position` text,
	`overall` integer NOT NULL,
	`from_club` text NOT NULL,
	`to_club` text NOT NULL,
	`occurred_at` text NOT NULL,
	`source_url` text,
	`discord_guild_id` text,
	`discord_channel_id` text,
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
