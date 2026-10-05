import type { Socket } from "socket.io";
import type { z } from "zod";
import {
	type Challenge,
	ChallengeSchema,
	type ClientGameMove,
	ClientGameMoveSchema,
} from "./schemas.js";

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

export const parseClientGameMove = (
	data: unknown,
): ParseResult<ClientGameMove> => {
	const result = ClientGameMoveSchema.safeParse(data);
	if (!result.success) {
		return {
			success: false,
			error: `Invalid move data: ${formatZodError(result.error)}`,
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

export const parseUsername = (username: unknown): ParseResult<string> => {
	if (typeof username !== "string" || username.trim().length === 0) {
		return { success: false, error: "Username must be a non-empty string" };
	}
	if (username.length > 50) {
		return { success: false, error: "Username too long (max 50 characters)" };
	}
	return { success: true, data: username.trim() };
};

export const parseGameId = (gameId: unknown): ParseResult<string> => {
	if (typeof gameId !== "string" || gameId.trim().length === 0) {
		return { success: false, error: "Game ID must be a non-empty string" };
	}
	return { success: true, data: gameId.trim() };
};

export const createParseMiddleware = () => {
	return (_socket: Socket, next: (err?: Error) => void) => {
		next();
	};
};
