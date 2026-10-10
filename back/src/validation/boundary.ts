import type { Socket } from "socket.io";
import type { z } from "zod";

const formatZodError = (error: z.ZodError): string =>
	error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");

/**
 * Wraps a socket.io event handler so the raw payload is zod-validated
 * before any business logic runs. Works for both single-payload events
 * (e.g. `game:move`) and events emitted with multiple positional
 * arguments (e.g. `challenge:new`), by validating against a tuple schema.
 * On failure, emits "game:error" and never calls the handler.
 *
 * Also catches any error thrown by the handler itself (e.g. a corrupt DB
 * row failing its own zod parse in a repository) - an async socket.io
 * listener that throws becomes an unhandled rejection, which by default
 * crashes the whole Node process, taking down every connected player.
 */
export const validateEvent = <S extends z.ZodTypeAny>(
	schema: S,
	socket: Pick<Socket, "emit">,
	handler: (data: z.infer<S>) => void | Promise<void>,
) => {
	return async (...args: unknown[]) => {
		const payload = args.length === 1 ? args[0] : args;
		const result = schema.safeParse(payload);
		if (!result.success) {
			socket.emit("game:error", formatZodError(result.error));
			return;
		}
		try {
			await handler(result.data);
		} catch (error) {
			console.error("Unhandled error in socket handler:", error);
			socket.emit("game:error", "Internal server error");
		}
	};
};
