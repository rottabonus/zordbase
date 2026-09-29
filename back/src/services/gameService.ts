import type {
	ClientGameMove,
	GameMove,
	GameStartData,
	GameState,
	LetterData,
	PlayedWordData,
	SocketServer,
} from "../types.ts";
import { InMemorySessionStore } from "./sessionService.ts";

const sessionStore = new InMemorySessionStore();

// In-memory game store
interface GameRoom {
	id: string;
	players: [string, string]; // [player1Id, player2Id]
	playerNames: Record<string, string>;
	board: string[][];
	base: LetterData[];
	turn: string; // userID of current turn
	playedWords: PlayedWordData[];
	status: "waiting" | "playing" | "finished";
	winner?: string;
	turnCount: number;
	player1Id: string; // Player who starts at row 0
}

const gameRooms = new Map<string, GameRoom>();

const generateGameId = () => Math.random().toString(36).slice(2, 10);

const createGameBoard = (rows: number, columns: number): string[][] => {
	const LETTERS =
		"aaaaaaaaaaaaiiiiiiiiiiittttttttttnnnnnnnnneeeeeeeesssssssslllllloooookkkkkuuuuuääääämmmmvvrrjjhhyyppdö".split(
			"",
		);
	const toArray = (num: number) => Array.from(Array(num).keys());
	const getRandomFrom = (arr: string[]) =>
		arr[Math.floor(Math.random() * arr.length)];
	return toArray(rows).map(() =>
		toArray(columns).map(() => getRandomFrom(LETTERS).toUpperCase()),
	);
};

const createInitialBase = (
	board: string[][],
	player1: string,
	player2: string,
): LetterData[] => {
	const rows = board.length;
	const cols = board[0].length;
	const base: LetterData[] = [];

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let owner = "none";
			if (r === 0) owner = player1;
			else if (r === rows - 1) owner = player2;

			base.push({
				letter: board[r][c],
				row: r,
				column: c,
				owner,
				possibleWords: [],
			});
		}
	}
	return base;
};

// Word validation - simple check if word exists in dictionary
// In production, this would use the word service
const validateWord = async (word: string): Promise<boolean> => {
	// For now, we'll accept any word >= 2 letters
	// TODO: integrate with actual word dictionary
	return word.length >= 2;
};

// Check if selection forms a valid path (adjacent letters)
const isValidPath = (selection: LetterData[]): boolean => {
	if (selection.length < 2) return false;

	for (let i = 1; i < selection.length; i++) {
		const prev = selection[i - 1];
		const curr = selection[i];
		const rowDiff = Math.abs(curr.row - prev.row);
		const colDiff = Math.abs(curr.column - prev.column);
		if (rowDiff > 1 || colDiff > 1) return false;
	}
	return true;
};

// Check if all selected letters belong to the current player or are neutral
const isValidOwnership = (
	selection: LetterData[],
	playerId: string,
): boolean => {
	return selection.every((s) => s.owner === playerId || s.owner === "none");
};

// Check win condition - player reaches opposite side
const checkWin = (
	base: LetterData[],
	playerId: string,
	boardRows: number,
	player1Id: string,
): boolean => {
	const targetRowForPlayer = playerId === player1Id ? boardRows - 1 : 0;
	return base.some((b) => b.owner === playerId && b.row === targetRowForPlayer);
};

// Update ownership and remove isolated nodes (adapted from frontend game.ts)
const updateOwnersAndRemoveIsolated = (
	newSelection: LetterData[],
	base: LetterData[],
	board: string[][],
	playerId: string,
	player1Id: string,
): LetterData[] => {
	// First, update ownership of selected letters
	const updated = base.map((o) => {
		const inSelection = newSelection.some(
			(s) => s.row === o.row && s.column === o.column,
		);
		if (inSelection) {
			return { ...o, owner: playerId };
		}
		return o;
	});

	// Remove isolated nodes (simplified version)
	// Find all nodes owned by opponent that are not connected to their base
	const opponentId = base.find(
		(b) => b.owner !== "none" && b.owner !== playerId,
	)?.owner;
	if (!opponentId) return updated;

	// Build adjacency graph
	const movements = generateMovements(board);
	const opponentNodes = updated.filter((o) => o.owner === opponentId);

	// Find opponent nodes connected to their starting edge
	const opponentStartRow = opponentId === player1Id ? 0 : board.length - 1; // player1Id starts at row 0, player2Id starts at row board.length - 1;
	const connectedOpponent = new Set<string>();
	const queue: LetterData[] = [];

	opponentNodes.forEach((n) => {
		if (n.row === opponentStartRow) {
			queue.push(n);
			connectedOpponent.add(`${n.row},${n.column}`);
		}
	});

	while (queue.length > 0) {
		const node = queue.shift();
		if (!node) continue;
		const neighbors = movements[`${node.row},${node.column}`] || [];
		neighbors.forEach((neighbor) => {
			const key = `${neighbor.row},${neighbor.column}`;
			if (!connectedOpponent.has(key)) {
				const oppNode = opponentNodes.find(
					(o) => o.row === neighbor.row && o.column === neighbor.column,
				);
				if (oppNode) {
					connectedOpponent.add(key);
					queue.push(oppNode);
				}
			}
		});
	}

	// Disconnect isolated opponent nodes
	return updated.map((o) => {
		if (
			o.owner === opponentId &&
			!connectedOpponent.has(`${o.row},${o.column}`)
		) {
			return { ...o, owner: "none" };
		}
		return o;
	});
};

const generateMovements = (board: string[][]) => {
	const moves: Record<string, LetterData[]> = {};
	board.forEach((row, r) => {
		row.forEach((_, c) => {
			moves[`${r},${c}`] = getNeighborsData(
				{ letter: board[r][c], row: r, column: c, owner: "none" },
				board,
			);
		});
	});
	return moves;
};

const getNeighborsData = (node: LetterData, board: string[][]) => {
	const possibleMoves: LetterData[] = [];
	const possibleXpositions = [node.row, node.row + 1, node.row - 1].filter(
		(x) => x >= 0 && x < board.length,
	);
	const possibleYpositions = [
		node.column,
		node.column + 1,
		node.column - 1,
	].filter((x) => x >= 0 && x < board[0].length);
	possibleXpositions.forEach((xPos) => {
		possibleYpositions.forEach((yPos) => {
			if (!(xPos === node.row && yPos === node.column)) {
				possibleMoves.push({
					row: xPos,
					column: yPos,
					letter: board[xPos][yPos],
					owner: "none",
				});
			}
		});
	});
	return possibleMoves;
};

const service = (io: SocketServer) => {
	io.on("connection", (socket) => {
		const getUserId = () => socket.data.userID ?? "";

		socket.on("challenge:new", (challengedID) => {
			const userId = getUserId();
			if (!userId) return;
			const challenge = { from: userId, to: challengedID };
			console.log("new challenge", challenge);
			socket.to(challenge.to).emit("challenge:got", challenge);
		});

		socket.on("challenge:accept", (challengerID) => {
			const userId = getUserId();
			if (!userId) return;
			const challenge = { from: userId, to: challengerID };
			console.log("game was accepted, now start with", challenge);

			// Create game room
			const gameId = generateGameId();
			const board = createGameBoard(12, 10);
			// challenge.from = challenged player (acceptor), challenge.to = challenger
			// Challenger starts at row 11 (bottom), challenged at row 0 (top)
			const base = createInitialBase(board, challenge.from, challenge.to);

			// Get player names
			const player1Name =
				sessionStore.findSession(challenge.from)?.username || "Player 1";
			const player2Name =
				sessionStore.findSession(challenge.to)?.username || "Player 2";

			const gameRoom: GameRoom = {
				id: gameId,
				players: [challenge.from, challenge.to],
				playerNames: {
					[challenge.from]: player1Name,
					[challenge.to]: player2Name,
				},
				board,
				base,
				turn: challenge.to, // Challenger starts (challenge.to is the challenger)
				playedWords: [],
				status: "playing",
				turnCount: 0,
				player1Id: challenge.from, // Player 1 is at row 0 (challenged)
			};

			gameRooms.set(gameId, gameRoom);

			// Join both players to game room
			socket.join(gameId);
			// Use io.in(userID).socketsJoin(room) to make the other player's socket join the game room
			io.in(challenge.to).socketsJoin(gameId);

			// Notify both players
			const startData: GameStartData = {
				gameId,
				players: [challenge.from, challenge.to],
				player1: challenge.from,
				player2: challenge.to,
				board,
			};

			io.to(gameId).emit("game:start", startData);

			// Send initial game state
			const gameState: GameState = {
				gameId,
				board,
				base,
				turn: challenge.to, // Challenger starts (challenge.to is the challenger)
				playedWords: [],
				players: [challenge.from, challenge.to],
				playerNames: gameRoom.playerNames,
				status: "playing",
				player1Id: challenge.from, // Player 1 is at row 0 (challenged)
			};
			io.to(gameId).emit("game:state", gameState);
		});

		socket.on("game:join", (gameId: string) => {
			const gameRoom = gameRooms.get(gameId);
			if (gameRoom) {
				socket.join(gameId);
				const gameState: GameState = {
					gameId: gameRoom.id,
					board: gameRoom.board,
					base: gameRoom.base,
					turn: gameRoom.turn,
					playedWords: gameRoom.playedWords,
					players: gameRoom.players,
					playerNames: gameRoom.playerNames,
					status: gameRoom.status,
					winner: gameRoom.winner,
					player1Id: gameRoom.player1Id,
				};
				socket.emit("game:state", gameState);
			} else {
				socket.emit("game:error", "Game not found");
			}
		});

		socket.on("game:move", async (move: ClientGameMove) => {
			const gameRoom = gameRooms.get(move.gameId);
			if (!gameRoom) {
				socket.emit("game:error", "Game not found");
				return;
			}

			// Validate it's the player's turn
			const userId = getUserId();
			if (!userId) return;
			if (gameRoom.turn !== userId) {
				socket.emit("game:error", "Not your turn");
				return;
			}

			// Validate game is still playing
			if (gameRoom.status !== "playing") {
				socket.emit("game:error", "Game already finished");
				return;
			}

			// Validate selection path
			if (!isValidPath(move.selection)) {
				socket.emit("game:error", "Invalid path - letters must be adjacent");
				return;
			}

			// Validate ownership
			if (!isValidOwnership(move.selection, userId)) {
				socket.emit(
					"game:error",
					"Can only select your own or neutral letters",
				);
				return;
			}

			// Validate word
			const wordValid = await validateWord(move.word);
			if (!wordValid) {
				socket.emit("game:error", "Invalid word");
				return;
			}

			// Check if word already played by this player
			const alreadyPlayed = gameRoom.playedWords.some(
				(pw) => pw.word === move.word && pw.owner === userId,
			);
			if (alreadyPlayed) {
				socket.emit("game:error", "Word already played");
				return;
			}

			// Apply move
			const newBase = updateOwnersAndRemoveIsolated(
				move.selection,
				gameRoom.base,
				gameRoom.board,
				userId,
				gameRoom.player1Id,
			);
			const newPlayedWords = [
				...gameRoom.playedWords,
				{
					word: move.word,
					owner: userId,
					turn: gameRoom.turnCount,
				},
			];

			// Check win
			const winner = checkWin(
				newBase,
				userId,
				gameRoom.board.length,
				gameRoom.player1Id,
			)
				? userId
				: undefined;

			// Determine next turn
			const nextTurn = winner
				? ""
				: (gameRoom.players.find((p) => p !== userId) ?? "");

			// Update game room
			gameRoom.base = newBase;
			gameRoom.playedWords = newPlayedWords;
			gameRoom.turn = nextTurn;
			gameRoom.turnCount++;
			if (winner) {
				gameRoom.status = "finished";
				gameRoom.winner = winner;
			}

			// Broadcast move to both players
			const gameMove: GameMove = {
				gameId: move.gameId,
				playerId: userId,
				selection: move.selection,
				word: move.word,
				newBase,
				playedWords: newPlayedWords,
				nextTurn,
				winner,
			};
			io.to(move.gameId).emit("game:move", gameMove);

			// If game ended, send end event
			if (winner) {
				const endData = {
					gameId: move.gameId,
					winner,
					reason: "win" as const,
				};
				io.to(move.gameId).emit("game:end", endData);
			}
		});

		// Handle disconnect during game
		socket.on("disconnect", async () => {
			const userId = getUserId();
			if (!userId) return;
			// Check if player was in an active game
			for (const [gameId, gameRoom] of gameRooms.entries()) {
				if (
					gameRoom.players.includes(userId) &&
					gameRoom.status === "playing"
				) {
					const otherPlayer = gameRoom.players.find((p) => p !== userId);
					if (otherPlayer) {
						gameRoom.status = "finished";
						gameRoom.winner = otherPlayer;
						io.to(gameId).emit("game:end", {
							gameId,
							winner: otherPlayer,
							reason: "disconnect",
						});
					}
					break;
				}
			}
		});
	});
};

export default { service };
