import { z } from "zod";

export interface LetterObject {
	letter: string;
	row: number;
	column: number;
	owner: string;
	possibleWords?: LetterObject[][];
}

export const LetterObjectSchema: z.ZodType<LetterObject> = z.object({
	letter: z.string().min(1).max(1),
	row: z.number().int().nonnegative(),
	column: z.number().int().nonnegative(),
	owner: z.string().min(1),
	possibleWords: z.array(z.array(z.lazy(() => LetterObjectSchema))).optional(),
});

export const PlayedWordSchema = z.object({
	word: z.string().min(1),
	owner: z.string().min(1),
	turn: z.number().int().nonnegative(),
});

export const GameStartDataSchema = z.object({
	gameId: z.string().min(1),
	players: z.tuple([z.string().min(1), z.string().min(1)]),
	player1: z.string().min(1),
	player2: z.string().min(1),
	board: z.array(z.array(z.string().min(1).max(1))),
});

export const GameStateSchema = z.object({
	gameId: z.string().min(1),
	board: z.array(z.array(z.string().min(1).max(1))),
	base: z.array(LetterObjectSchema),
	turn: z.string().min(1),
	playedWords: z.array(PlayedWordSchema),
	players: z.tuple([z.string().min(1), z.string().min(1)]),
	playerNames: z.record(z.string().min(1), z.string().min(1)),
	status: z.enum(["waiting", "playing", "finished"]),
	winner: z.string().min(1).optional(),
	player1Id: z.string().min(1),
});

export const GameMoveSchema = z.object({
	gameId: z.string().min(1),
	playerId: z.string().min(1),
	selection: z.array(LetterObjectSchema),
	word: z.string().min(1),
	newBase: z.array(LetterObjectSchema),
	playedWords: z.array(PlayedWordSchema),
	nextTurn: z.string().min(1),
	winner: z.string().min(1).optional(),
});

export const ClientGameMoveSchema = z.object({
	gameId: z.string().min(1),
	selection: z.array(LetterObjectSchema).min(2),
	word: z.string().min(2),
});

export const GameEndDataSchema = z.object({
	gameId: z.string().min(1),
	winner: z.string().min(1),
	reason: z.enum(["win", "forfeit", "disconnect"]),
});

export const ChallengeSchema = z.object({
	from: z.string().min(1),
	to: z.string().min(1),
	fromUsername: z.string().min(1),
});

export const UserSchema = z.object({
	username: z.string().optional(),
	userID: z.string().min(1),
	connected: z.boolean().optional(),
});

export const SessionSchema = z.object({
	userID: z.string().min(1),
	sessionID: z.string().min(1),
});

export type PlayedWord = z.infer<typeof PlayedWordSchema>;
export type GameStartData = z.infer<typeof GameStartDataSchema>;
export type GameState = z.infer<typeof GameStateSchema>;
export type GameMove = z.infer<typeof GameMoveSchema>;
export type ClientGameMove = z.infer<typeof ClientGameMoveSchema>;
export type GameEndData = z.infer<typeof GameEndDataSchema>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export type User = z.infer<typeof UserSchema>;
export type Session = z.infer<typeof SessionSchema>;
