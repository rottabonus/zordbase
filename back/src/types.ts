export interface Words {
  words: String[];
}

export type User = { username?: string; userID: string };
export interface ServerToClientEvents {
  users: (users: Array<User>) => void;
  userconnected: (data: User) => void;
  userdisconnected: (id: string) => void;
}

export interface ClientToServerEvents {
  setusername: (username: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  username: string;
}

