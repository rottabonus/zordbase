import { and, desc, eq, or } from "drizzle-orm";
import { db } from "./client.ts";
import { type GameRoom, gameRooms, type NewGameRoom } from "./schema.ts";

export const gameRoomRepository = {
	async create(room: NewGameRoom): Promise<GameRoom> {
		const result = await db.insert(gameRooms).values(room).returning();
		return result[0];
	},

	async findById(id: string): Promise<GameRoom | undefined> {
		const result = await db
			.select()
			.from(gameRooms)
			.where(eq(gameRooms.id, id))
			.limit(1);
		return result[0];
	},

	async findByPlayerId(
		playerId: string,
		status?: "waiting" | "playing" | "finished",
	): Promise<GameRoom[]> {
		const conditions = [
			or(eq(gameRooms.player1Id, playerId), eq(gameRooms.player2Id, playerId)),
		];
		if (status) {
			conditions.push(eq(gameRooms.status, status));
		}
		return db
			.select()
			.from(gameRooms)
			.where(and(...conditions))
			.orderBy(desc(gameRooms.createdAt));
	},

	async update(
		id: string,
		data: Partial<NewGameRoom>,
	): Promise<GameRoom | undefined> {
		const result = await db
			.update(gameRooms)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(gameRooms.id, id))
			.returning();
		return result[0];
	},

	async delete(id: string): Promise<void> {
		await db.delete(gameRooms).where(eq(gameRooms.id, id));
	},

	async findActiveForUser(userId: string): Promise<GameRoom | undefined> {
		const result = await db
			.select()
			.from(gameRooms)
			.where(
				and(
					or(eq(gameRooms.player1Id, userId), eq(gameRooms.player2Id, userId)),
					eq(gameRooms.status, "playing"),
				),
			)
			.limit(1);
		return result[0];
	},
};
