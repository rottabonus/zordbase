import type { SocketData } from "../types.ts";

type Session = Omit<SocketData, "sessionID">;
abstract class SessionStore {
	abstract findSession(id: string): Session | undefined;
	abstract findSessionByUserId(userId: string): Session | undefined;
	abstract saveSession(id: string, session: Session): void;
	abstract findAllSessions(): Array<Session>;
	abstract findAllBut(id: string): Array<Session>;
}

class InMemorySessionStore extends SessionStore {
	sessions: Map<string, Session>;
	constructor() {
		super();
		this.sessions = new Map();
	}

	findSession(id: string) {
		return this.sessions.get(id);
	}

	findSessionByUserId(userId: string) {
		for (const session of this.sessions.values()) {
			if (session.userID === userId) {
				return session;
			}
		}
		return undefined;
	}

	saveSession(id: string, session: Session) {
		this.sessions.set(id, session);
	}

	findAllSessions() {
		return [...this.sessions.values()];
	}

	findAllBut(id: string) {
		return [...this.sessions.entries()]
			.filter(([sessionId]) => sessionId !== id)
			.map(([, session]) => session);
	}
}

const sessionStore = new InMemorySessionStore();

export { InMemorySessionStore, sessionStore };
