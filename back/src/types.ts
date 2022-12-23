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

type Challenge = { from: string; to: string };
export interface ServerToClientEvents {
  ["users:list"]: (users: Array<User>) => void;
  ["user:connected"]: (data: User) => void;
  ["user:disconnected"]: (id: string) => void;
  ["session:set"]: (
    data: Partial<Pick<SocketData, "userID" | "sessionID">>
  ) => void;
  ["challenge:got"]: (challenge: Challenge) => void;
  ["game:start"]: (challenge: Challenge) => void;
}

export interface ClientToServerEvents {
  ["username:set"]: (username: string) => void;
  ["challenge:new"]: (challenged: string) => void;
  ["challenge:accept"]: (challenger: string) => void;
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
