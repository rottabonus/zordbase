import type { Server } from "socket.io";
import type {
	Challenge,
	ClientGameMove,
	GameEndData,
	GameMove,
	GameStartData,
	GameState,
	LetterData,
	PlayedWordData,
	User,
} from "./validation/schemas.ts";

export interface Words {
	words: string[];
}

export type SocketServer = Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;

export interface ServerToClientEvents {
	"users:list": (users: Array<User>) => void;
	"user:connected": (data: User) => void;
	"user:disconnected": (id: string) => void;
	"session:set": (
		data: Partial<Pick<SocketData, "userID" | "sessionID">>,
	) => void;
	"challenge:got": (challenge: Challenge) => void;
	"game:start": (data: GameStartData) => void;
	"game:state": (state: GameState) => void;
	"game:move": (move: GameMove) => void;
	"game:turn": (turn: string) => void;
	"game:end": (data: GameEndData) => void;
	"game:error": (error: string) => void;
}

export interface ClientToServerEvents {
	"challenge:new": (challenged: string, challengerUsername: string) => void;
	"challenge:accept": (challenger: string, acceptorUsername: string) => void;
	"game:move": (move: ClientGameMove) => void;
	"game:join": (gameId: string) => void;
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

// Re-exported so existing imports of these types from "./types.ts"
// keep working; the shapes themselves are defined once in /shared.
export type {
	Challenge,
	ClientGameMove,
	GameEndData,
	GameMove,
	GameStartData,
	GameState,
	LetterData,
	PlayedWordData,
	User,
};
