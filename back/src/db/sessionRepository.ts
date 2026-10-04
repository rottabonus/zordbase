import { and, eq, ne } from "drizzle-orm";
import { db } from "./client.ts";
import { type NewSession, type Session, sessions } from "./schema.ts";

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
