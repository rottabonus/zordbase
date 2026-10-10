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
		await handler(result.data);
	};
};
