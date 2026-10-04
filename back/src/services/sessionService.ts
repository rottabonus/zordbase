import { sessionRepository } from "../db/sessionRepository.ts";
import type { SocketData } from "../types.ts";

type Session = Omit<SocketData, "sessionID">;

class SessionStore {
	async findSession(id: string) {
		const session = await sessionRepository.findById(id);
		if (!session) return undefined;
		return {
			userID: session.userId,
			username: session.username,
			connected: session.connected,
		};
	}

	async findSessionByUserId(userId: string) {
		const session = await sessionRepository.findByUserId(userId);
		if (!session) return undefined;
		return {
			userID: session.userId,
			username: session.username,
			connected: session.connected,
		};
	}

	async saveSession(id: string, session: Session) {
		await sessionRepository.save({
			id,
			userId: session.userID,
			username: session.username,
			connected: session.connected,
		});
	}

	async findAllSessions() {
		const sessions = await sessionRepository.findAll();
		return sessions.map((s) => ({
			userID: s.userId,
			username: s.username,
			connected: s.connected,
		}));
	}

	async findAllBut(id: string) {
		const sessions = await sessionRepository.findAllBut(id);
		return sessions.map((s) => ({
			userID: s.userId,
			username: s.username,
			connected: s.connected,
		}));
	}
}

const sessionStore = new SessionStore();

export { sessionStore };
