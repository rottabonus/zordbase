import type { Server } from "socket.io";
export interface Words {
	words: string[];
}

export type SocketServer = Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;
export type User = { username: string; userID: string };

type Challenge = { from: string; to: string; fromUsername: string };
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
	"username:set": (username: string) => void;
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

// New types for multiplayer game
export interface GameStartData {
	gameId: string;
	players: [string, string]; // [player1Id, player2Id]
	player1: string; // userID of player 1 (starts first)
	player2: string; // userID of player 2
	board: string[][];
}

export interface GameState {
	gameId: string;
	board: string[][];
	base: LetterData[];
	turn: string; // userID of current turn
	playedWords: PlayedWordData[];
	players: [string, string];
	playerNames: Record<string, string>;
	status: "waiting" | "playing" | "finished";
	winner?: string;
	player1Id: string; // userID of player at row 0
}

export interface LetterData {
	letter: string;
	row: number;
	column: number;
	owner: string; // userID or "none"
	possibleWords?: LetterData[][];
}

export interface PlayedWordData {
	word: string;
	owner: string; // userID
	turn: number;
}

export interface GameMove {
	gameId: string;
	playerId: string;
	selection: LetterData[];
	word: string;
	newBase: LetterData[];
	playedWords: PlayedWordData[];
	nextTurn: string; // userID of next player
	winner?: string;
}

export interface ClientGameMove {
	gameId: string;
	selection: LetterData[];
	word: string;
}

export interface GameEndData {
	gameId: string;
	winner: string; // userID
	reason: "win" | "forfeit" | "disconnect";
}
