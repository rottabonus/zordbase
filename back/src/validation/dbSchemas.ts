import { z } from "zod";
import {
	LetterDataSchema,
	PlayedWordDataSchema,
} from "../../../shared/schemas.ts";

// Drizzle's `jsonb(...).$type<T>()` (see db/schema.ts) is a compile-time-only
// cast - it does not validate the stored JSON at read time. These schemas
// catch corruption from stale rows, bad migrations, or bugs before it
// reaches game logic, reusing the same wire-format schemas as the sockets.

const BoardSchema = z.array(z.array(z.string()));
const LetterDataArraySchema = z.array(LetterDataSchema);
const PlayedWordsSchema = z.array(PlayedWordDataSchema);

export const parseGameRoomJson = <
	T extends { board: unknown; base: unknown; playedWords: unknown },
>(
	row: T,
): T => ({
	...row,
	board: BoardSchema.parse(row.board),
	base: LetterDataArraySchema.parse(row.base),
	playedWords: PlayedWordsSchema.parse(row.playedWords),
});

export const parseGameMoveJson = <
	T extends { selection: unknown; newBase: unknown; playedWords: unknown },
>(
	row: T,
): T => ({
	...row,
	selection: LetterDataArraySchema.parse(row.selection),
	newBase: LetterDataArraySchema.parse(row.newBase),
	playedWords: PlayedWordsSchema.parse(row.playedWords),
});
