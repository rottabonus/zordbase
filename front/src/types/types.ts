export type letterObject = {
	letter: string;
	row: number;
	column: number;
	owner: string;
	possibleWords?: letterObject[][];
};

export type selectionObject = {
	possibleSelection: boolean;
	selectedBeforeIndex: number;
};

export type playedWord = {
	word: string;
	owner: string;
	turn: number;
};

export interface GameBoardState {
	board: string[][];
	newGame: boolean;
	turn: string;
	isLoading: boolean;
}

export type Turn = {
	base: letterObject[];
	selection: letterObject[];
	turn: string;
};

export interface BaseState {
	base: letterObject[];
	selection: letterObject[];
	playedWords: playedWord[];
	playerName: string;
	possibleWordPositions: Record<string, string[]>;
	stateHistory: Array<Turn>;
}

export interface MessageState {
	message: string;
	show: boolean;
	type: string;
	resolution: boolean;
}

export interface PlayedWordState {
	playedWords: playedWord[];
}

export type LetterStyle = {
	backgroundColor: string;
	class: string;
	cursor: string;
};

export type PlayerWordStyle = {
	color: string;
	textAlign: "left" | "right" | "center";
};

export type ButtonVisibility = {
	visibility: "visible" | "hidden" | "collapse";
	cursor: "pointer" | "auto";
};

export interface GameState {
	gameId: string;
	board: string[][];
	base: letterObject[];
	turn: string;
	playedWords: playedWord[];
	players: [string, string];
	playerNames: Record<string, string>;
	status: "waiting" | "playing" | "finished";
	winner?: string;
	player1Id: string;
}

export interface GameMove {
	gameId: string;
	playerId: string;
	selection: letterObject[];
	word: string;
	newBase: letterObject[];
	playedWords: playedWord[];
	nextTurn: string;
	winner?: string;
}

export interface GameEndData {
	gameId: string;
	winner: string;
	reason: "win" | "forfeit" | "disconnect";
}

export interface GameServerToClientEvents {
	"game:state": (state: GameState) => void;
	"game:move": (move: GameMove) => void;
	"game:turn": (turn: string) => void;
	"game:end": (data: GameEndData) => void;
	"game:error": (error: string) => void;
}

export interface GameClientToServerEvents {
	"game:join": (gameId: string) => void;
	"game:move": (move: {
		gameId: string;
		selection: letterObject[];
		word: string;
	}) => void;
}

export interface GameStartData {
	gameId: string;
	players: [string, string];
	player1: string;
	player2: string;
	board: string[][];
}

export type User = { username?: string; userID: string; connected: boolean };
export type Challenge = { from: string; to: string; fromUsername: string };

export interface LobbyServerToClientEvents {
	"users:list": (users: Array<User>) => void;
	"user:connected": (data: User) => void;
	"user:disconnected": (id: string) => void;
	"session:set": (data: Session) => void;

	"challenge:got": (challenge: Challenge) => void;
	"game:start": (data: GameStartData) => void;
}

export type Session = { userID: string; sessionID: string };

export interface LobbyClientToServerEvents {
	"challenge:new": (challenged: string, challengerUsername: string) => void;
	"challenge:accept": (challenger: string, acceptorUsername: string) => void;
}
