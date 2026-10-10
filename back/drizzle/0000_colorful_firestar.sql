CREATE TABLE "game_moves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" text NOT NULL,
	"player_id" text NOT NULL,
	"selection" jsonb NOT NULL,
	"word" text NOT NULL,
	"new_base" jsonb NOT NULL,
	"played_words" jsonb NOT NULL,
	"next_turn" text,
	"winner" text,
	"turn_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"player1_id" text NOT NULL,
	"player2_id" text NOT NULL,
	"player1_name" text NOT NULL,
	"player2_name" text NOT NULL,
	"board" jsonb NOT NULL,
	"base" jsonb NOT NULL,
	"turn" text NOT NULL,
	"played_words" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'playing' NOT NULL,
	"winner" text,
	"turn_count" integer DEFAULT 0 NOT NULL,
	"player1_id_at_row0" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"connected" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_moves" ADD CONSTRAINT "game_moves_game_id_game_rooms_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_moves_game_id_idx" ON "game_moves" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "game_moves_player_id_idx" ON "game_moves" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "game_rooms_player1_idx" ON "game_rooms" USING btree ("player1_id");--> statement-breakpoint
CREATE INDEX "game_rooms_player2_idx" ON "game_rooms" USING btree ("player2_id");--> statement-breakpoint
CREATE INDEX "game_rooms_status_idx" ON "game_rooms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");