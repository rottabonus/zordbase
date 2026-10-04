import { and, desc, eq, ne, or } from "drizzle-orm";
import { db } from "./client.js";
import {
	type GameMove,
	type GameRoom,
	gameMoves,
	gameRooms,
	type NewGameMove,
	type NewGameRoom,
	type NewSession,
	type Session,
	sessions,
} from "./schema.js";

export const sessionRepository = {
	async findById(id: string): Promise<Session | undefined> {
		const result = await db
			.select()
			.from(sessions)
			.where(eq(sessions.id, id))
			.limit(1);
		return result[0];
	},

	async findByUserId(userId: string): Promise<Session | undefined> {
		const result = await db
			.select()
			.from(sessions)
			.where(and(eq(sessions.userId, userId), eq(sessions.connected, true)))
			.limit(1);
		return result[0];
	},

	async save(session: NewSession): Promise<void> {
		await db
			.insert(sessions)
			.values(session)
			.onConflictDoUpdate({
				target: sessions.id,
				set: {
					userId: session.userId,
					username: session.username,
					connected: session.connected,
					updatedAt: new Date(),
				},
			});
	},

	async findAll(): Promise<Session[]> {
		return db.select().from(sessions);
	},

	async findAllBut(excludeId: string): Promise<Session[]> {
		return db.select().from(sessions).where(ne(sessions.id, excludeId));
	},

	async setConnected(id: string, connected: boolean): Promise<void> {
		await db
			.update(sessions)
			.set({ connected, updatedAt: new Date() })
			.where(eq(sessions.id, id));
	},

	async delete(id: string): Promise<void> {
		await db.delete(sessions).where(eq(sessions.id, id));
	},
};

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
