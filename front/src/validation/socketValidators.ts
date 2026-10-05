import type { z } from "zod";
import {
	type Challenge,
	ChallengeSchema,
	ClientGameMoveSchema,
	type GameEndData,
	GameEndDataSchema,
	type GameMove,
	GameMoveSchema,
	type GameStartData,
	GameStartDataSchema,
	type GameState,
	GameStateSchema,
	type Session,
	SessionSchema,
	type User,
	UserSchema,
} from "../validation/schemas";

export interface ParseResult<T> {
	success: boolean;
	data?: T;
	error?: string;
}

const formatZodError = (error: z.ZodError): string => {
	return error.issues
		.map((e) => `${e.path.join(".")}: ${e.message}`)
		.join(", ");
};

export const parseGameState = (data: unknown): ParseResult<GameState> => {
	const result = GameStateSchema.safeParse(data);
	if (!result.success) {
		return {
			success: false,
			error: `Invalid game state: ${formatZodError(result.error)}`,
		};
	}
	return { success: true, data: result.data };
};

export const parseGameMove = (data: unknown): ParseResult<GameMove> => {
	const result = GameMoveSchema.safeParse(data);
	if (!result.success) {
		return {
			success: false,
			error: `Invalid game move: ${formatZodError(result.error)}`,
		};
	}
	return { success: true, data: result.data };
};

export const parseGameEnd = (data: unknown): ParseResult<GameEndData> => {
	const result = GameEndDataSchema.safeParse(data);
	if (!result.success) {
		return {
			success: false,
			error: `Invalid game end data: ${formatZodError(result.error)}`,
		};
	}
	return { success: true, data: result.data };
};

export const parseGameStart = (data: unknown): ParseResult<GameStartData> => {
	const result = GameStartDataSchema.safeParse(data);
	if (!result.success) {
		return {
			success: false,
			error: `Invalid game start data: ${formatZodError(result.error)}`,
		};
	}
	return { success: true, data: result.data };
};

export const parseChallenge = (data: unknown): ParseResult<Challenge> => {
	const result = ChallengeSchema.safeParse(data);
	if (!result.success) {
		return {
			success: false,
			error: `Invalid challenge data: ${formatZodError(result.error)}`,
		};
	}
	return { success: true, data: result.data };
};

export const parseUser = (data: unknown): ParseResult<User> => {
	const result = UserSchema.safeParse(data);
	if (!result.success) {
		return {
			success: false,
			error: `Invalid user data: ${formatZodError(result.error)}`,
		};
	}
	return { success: true, data: result.data };
};

export const parseSession = (data: unknown): ParseResult<Session> => {
	const result = SessionSchema.safeParse(data);
	if (!result.success) {
		return {
			success: false,
			error: `Invalid session data: ${formatZodError(result.error)}`,
		};
	}
	return { success: true, data: result.data };
};

export const parseClientGameMove = (data: unknown) => {
	const result = ClientGameMoveSchema.safeParse(data);
	if (!result.success) {
		return {
			success: false,
			error: `Invalid move data: ${formatZodError(result.error)}`,
		};
	}
	return { success: true, data: result.data };
};

export const createSocketParsers = () => ({
	"game:state": parseGameState,
	"game:move": parseGameMove,
	"game:end": parseGameEnd,
	"game:start": parseGameStart,
	"challenge:got": parseChallenge,
	"user:connected": parseUser,
	"session:set": parseSession,
});

export type SocketEventParser = {
	[K in keyof typeof createSocketParsers extends infer T ? T : never]: (
		data: unknown,
	) => ParseResult<unknown>;
};
