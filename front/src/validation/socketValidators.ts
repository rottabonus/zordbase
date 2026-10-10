import { z } from "zod";
import {
	ChallengeSchema,
	GameEndDataSchema,
	GameMoveSchema,
	GameStartDataSchema,
	GameStateSchema,
	SessionSchema,
	UserSchema,
} from "./schemas";

export interface ParseResult<T> {
	success: boolean;
	data?: T;
	error?: string;
}

const formatZodError = (error: z.ZodError): string =>
	error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");

const parse = <S extends z.ZodTypeAny>(
	schema: S,
	data: unknown,
	label: string,
): ParseResult<z.infer<S>> => {
	const result = schema.safeParse(data);
	if (!result.success) {
		return {
			success: false,
			error: `Invalid ${label}: ${formatZodError(result.error)}`,
		};
	}
	return { success: true, data: result.data };
};

// Incoming (socket.on) payloads - validated as soon as they arrive, before
// any handler touches them.
export const parseGameState = (data: unknown) =>
	parse(GameStateSchema, data, "game state");
export const parseGameMove = (data: unknown) =>
	parse(GameMoveSchema, data, "game move");
export const parseGameEnd = (data: unknown) =>
	parse(GameEndDataSchema, data, "game end data");
export const parseGameStart = (data: unknown) =>
	parse(GameStartDataSchema, data, "game start data");
export const parseChallenge = (data: unknown) =>
	parse(ChallengeSchema, data, "challenge data");
export const parseUser = (data: unknown) =>
	parse(UserSchema, data, "user data");
export const parseUsersList = (data: unknown) =>
	parse(UserSchema.array(), data, "users list");
export const parseUserId = (data: unknown) =>
	parse(z.string().min(1), data, "user id");
export const parseSession = (data: unknown) =>
	parse(SessionSchema, data, "session data");
export const parseGameErrorMessage = (data: unknown) =>
	parse(z.string(), data, "game error message");

// Method-shorthand syntax so this stays assignable from a strictly-typed
// socket.io-client `Socket<...>` (whose `emit` only accepts its own literal
// union of event names) - TS checks method parameters bivariantly.
type Emitter = { emit(event: string, ...args: unknown[]): unknown };

/**
 * Validates a payload against `schema` and, if valid, emits it on `socket`.
 * This covers outgoing (socket.emit) payloads - validated right before they
 * leave the client, so a client-side bug surfaces immediately instead of
 * round-tripping to the server and back as a "game:error". Tuple-schema
 * results are spread as positional args (matching events like
 * `challenge:new` that take multiple arguments); everything else is sent as
 * a single argument. Returns false (and logs) without emitting on failure.
 */
export const emitValidated = <S extends z.ZodTypeAny>(
	socket: Emitter | null | undefined,
	event: string,
	schema: S,
	payload: unknown,
): boolean => {
	const result = parse(schema, payload, `outgoing "${event}"`);
	if (!result.success || result.data === undefined) {
		console.error(result.error);
		return false;
	}
	const args = Array.isArray(result.data) ? result.data : [result.data];
	socket?.emit(event, ...args);
	return true;
};
