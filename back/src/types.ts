import { Server } from "socket.io";
export interface Words {
  words: String[];
}

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
export type User = { username: string; userID: string };
export interface ServerToClientEvents {
  users: (users: Array<User>) => void;
  userconnected: (data: User) => void;
  userdisconnected: (id: string) => void;
  session: (data: Partial<Pick<SocketData, "userID" | "sessionID">>) => void;
}

export interface ClientToServerEvents {
  setusername: (username: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  username: string;
  userID: string;
  connected: boolean;
  sessionID: string;
}
