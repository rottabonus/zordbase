import { desc, eq } from "drizzle-orm";
import { db } from "./client.ts";
import { type GameMove, gameMoves, type NewGameMove } from "./schema.ts";

export const gameMoveRepository = {
	async create(move: NewGameMove): Promise<GameMove> {
		const result = await db.insert(gameMoves).values(move).returning();
		return result[0];
	},

	async findByGameId(gameId: string): Promise<GameMove[]> {
		return db
			.select()
			.from(gameMoves)
			.where(eq(gameMoves.gameId, gameId))
			.orderBy(gameMoves.turnNumber);
	},

	async findLastByGameId(gameId: string): Promise<GameMove | undefined> {
		const result = await db
			.select()
			.from(gameMoves)
			.where(eq(gameMoves.gameId, gameId))
			.orderBy(desc(gameMoves.turnNumber))
			.limit(1);
		return result[0];
	},
};
