import { SocketData } from "../types";
type Session = SocketData & {
  connected: boolean;
};

abstract class SessionStore {
  abstract findSession(id: string): Session | undefined;
  abstract saveSession(id: string, session: Session): void;
  abstract findAllSessions(): Array<Session>;
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

  saveSession(id: string, session: Session) {
    this.sessions.set(id, session);
  }

  findAllSessions() {
    return [...this.sessions.values()];
  }
}

export { InMemorySessionStore };
