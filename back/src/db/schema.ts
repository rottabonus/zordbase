import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const sessions = pgTable(
	"sessions",
	{
		id: text("id").primaryKey(), // sessionID
		userId: text("user_id").notNull(),
		username: text("username").notNull(),
		connected: boolean("connected").default(true).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index("sessions_user_id_idx").on(table.userId),
	}),
);

export const gameRooms = pgTable(
	"game_rooms",
	{
		id: text("id").primaryKey(), // gameId
		player1Id: text("player1_id").notNull(),
		player2Id: text("player2_id").notNull(),
		player1Name: text("player1_name").notNull(),
		player2Name: text("player2_name").notNull(),
		board: jsonb("board").$type<string[][]>().notNull(),
		base: jsonb("base")
			.$type<
				Array<{
					letter: string;
					row: number;
					column: number;
					owner: string;
					possibleWords?: Array<
						Array<{
							letter: string;
							row: number;
							column: number;
							owner: string;
						}>
					>;
				}>
			>()
			.notNull(),
		turn: text("turn").notNull(), // userID of current turn
		playedWords: jsonb("played_words")
			.$type<
				Array<{
					word: string;
					owner: string;
					turn: number;
				}>
			>()
			.default([])
			.notNull(),
		status: text("status", { enum: ["waiting", "playing", "finished"] })
			.default("playing")
			.notNull(),
		winner: text("winner"),
		turnCount: integer("turn_count").default(0).notNull(),
		player1IdAtRow0: text("player1_id_at_row0").notNull(), // Player at row 0 (top)
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		player1Idx: index("game_rooms_player1_idx").on(table.player1Id),
		player2Idx: index("game_rooms_player2_idx").on(table.player2Id),
		statusIdx: index("game_rooms_status_idx").on(table.status),
	}),
);

// Game moves history - for replay/analytics
export const gameMoves = pgTable(
	"game_moves",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		gameId: text("game_id")
			.notNull()
			.references(() => gameRooms.id, { onDelete: "cascade" }),
		playerId: text("player_id").notNull(),
		selection: jsonb("selection")
			.$type<
				Array<{
					letter: string;
					row: number;
					column: number;
					owner: string;
				}>
			>()
			.notNull(),
		word: text("word").notNull(),
		newBase: jsonb("new_base")
			.$type<
				Array<{
					letter: string;
					row: number;
					column: number;
					owner: string;
					possibleWords?: Array<
						Array<{
							letter: string;
							row: number;
							column: number;
							owner: string;
						}>
					>;
				}>
			>()
			.notNull(),
		playedWords: jsonb("played_words")
			.$type<
				Array<{
					word: string;
					owner: string;
					turn: number;
				}>
			>()
			.notNull(),
		nextTurn: text("next_turn"),
		winner: text("winner"),
		turnNumber: integer("turn_number").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		gameIdIdx: index("game_moves_game_id_idx").on(table.gameId),
		playerIdIdx: index("game_moves_player_id_idx").on(table.playerId),
	}),
);

// Relations
export const gameRoomsRelations = relations(gameRooms, ({ many }) => ({
	moves: many(gameMoves),
}));

export const gameMovesRelations = relations(gameMoves, ({ one }) => ({
	gameRoom: one(gameRooms, {
		fields: [gameMoves.gameId],
		references: [gameRooms.id],
	}),
}));

// Types for use in services
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type GameRoom = typeof gameRooms.$inferSelect;
export type NewGameRoom = typeof gameRooms.$inferInsert;

export type GameMove = typeof gameMoves.$inferSelect;
export type NewGameMove = typeof gameMoves.$inferInsert;
