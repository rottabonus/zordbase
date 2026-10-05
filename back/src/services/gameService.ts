import { gameMoveRepository } from "../db/gameMoveRepository.ts";
import { gameRoomRepository } from "../db/gameRoomRepository.ts";
import type { GameRoom as DbGameRoom } from "../db/schema.ts";
import type {
	ClientGameMove,
	GameMove,
	GameStartData,
	GameState,
	LetterData,
	PlayedWordData,
	SocketServer,
} from "../types.ts";
import { parseClientGameMove, parseGameId } from "../validation/middleware.ts";
import { sessionStore } from "./sessionService.ts";

interface GameRoom {
	id: string;
	players: [string, string];
	playerNames: Record<string, string>;
	board: string[][];
	base: LetterData[];
	turn: string;
	playedWords: PlayedWordData[];
	status: "waiting" | "playing" | "finished";
	winner?: string;
	turnCount: number;
	player1Id: string;
}

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

const validateWord = async (word: string): Promise<boolean> => {
	return word.length >= 2;
};

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

const isValidOwnership = (
	selection: LetterData[],
	playerId: string,
): boolean => {
	return selection.every((s) => s.owner === playerId || s.owner === "none");
};

const checkWin = (
	base: LetterData[],
	playerId: string,
	boardRows: number,
	player1Id: string,
): boolean => {
	const targetRowForPlayer = playerId === player1Id ? boardRows - 1 : 0;
	return base.some((b) => b.owner === playerId && b.row === targetRowForPlayer);
};

const updateOwnersAndRemoveIsolated = (
	newSelection: LetterData[],
	base: LetterData[],
	board: string[][],
	playerId: string,
	player1Id: string,
): LetterData[] => {
	const updated = base.map((o) => {
		const inSelection = newSelection.some(
			(s) => s.row === o.row && s.column === o.column,
		);
		if (inSelection) {
			return { ...o, owner: playerId };
		}
		return o;
	});

	const opponentId = base.find(
		(b) => b.owner !== "none" && b.owner !== playerId,
	)?.owner;
	if (!opponentId) return updated;

	const movements = generateMovements(board);
	const opponentNodes = updated.filter((o) => o.owner === opponentId);

	const opponentStartRow = opponentId === player1Id ? 0 : board.length - 1;
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

const toInternalGameRoom = (dbRoom: DbGameRoom): GameRoom => ({
	id: dbRoom.id,
	players: [dbRoom.player1Id, dbRoom.player2Id],
	playerNames: {
		[dbRoom.player1Id]: dbRoom.player1Name,
		[dbRoom.player2Id]: dbRoom.player2Name,
	},
	board: dbRoom.board,
	base: dbRoom.base,
	turn: dbRoom.turn,
	playedWords: dbRoom.playedWords,
	status: dbRoom.status,
	winner: dbRoom.winner ?? undefined,
	turnCount: dbRoom.turnCount,
	player1Id: dbRoom.player1IdAtRow0,
});

const service = (io: SocketServer) => {
	io.on("connection", (socket) => {
		const getUserId = () => socket.data.userID ?? "";

		socket.on("challenge:new", (challengedID, challengerUsername) => {
			const userId = getUserId();
			if (!userId) return;
			const challenge = {
				from: userId,
				to: challengedID,
				fromUsername: challengerUsername,
			};
			console.log("new challenge", challenge);
			socket.to(challenge.to).emit("challenge:got", challenge);
		});

		socket.on("challenge:accept", async (challengerID, _acceptorUsername) => {
			const userId = getUserId();
			const acceptorUsername = socket.data.username ?? "";
			if (!userId) return;
			const challenge = { from: userId, to: challengerID };
			console.log("game was accepted, now start with", challenge);

			const gameId = generateGameId();
			const board = createGameBoard(12, 10);
			const base = createInitialBase(board, challenge.from, challenge.to);

			const player1Name = acceptorUsername || "Player 1";
			const challengerSession =
				await sessionStore.findSessionByUserId(challengerID);
			const player2Name = challengerSession?.username ?? "Player 2";

			const gameRoomData = {
				id: gameId,
				player1Id: challenge.from,
				player2Id: challenge.to,
				player1Name,
				player2Name,
				board,
				base,
				turn: challenge.to,
				playedWords: [],
				status: "playing" as const,
				turnCount: 0,
				player1IdAtRow0: challenge.from,
			};

			await gameRoomRepository.create(gameRoomData);

			socket.join(gameId);
			io.in(challenge.to).socketsJoin(gameId);

			const startData: GameStartData = {
				gameId,
				players: [challenge.from, challenge.to],
				player1: challenge.from,
				player2: challenge.to,
				board,
			};

			io.to(gameId).emit("game:start", startData);

			const gameState: GameState = {
				gameId,
				board,
				base,
				turn: challenge.to,
				playedWords: [],
				players: [challenge.from, challenge.to],
				playerNames: {
					[challenge.from]: player1Name,
					[challenge.to]: player2Name,
				},
				status: "playing",
				player1Id: challenge.from,
			};
			io.to(gameId).emit("game:state", gameState);
		});

		socket.on("game:join", async (gameId: string) => {
			const parsed = parseGameId(gameId);
			if (!parsed.success || !parsed.data) {
				socket.emit("game:error", parsed.error ?? "Invalid game ID");
				return;
			}
			const dbRoom = await gameRoomRepository.findById(parsed.data);
			if (dbRoom) {
				const gameRoom = toInternalGameRoom(dbRoom);
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
			const parsed = parseClientGameMove(move);
			if (!parsed.success || !parsed.data) {
				socket.emit("game:error", parsed.error ?? "Invalid move data");
				return;
			}
			const parsedMove = parsed.data;

			const dbRoom = await gameRoomRepository.findById(parsedMove.gameId);
			if (!dbRoom) {
				socket.emit("game:error", "Game not found");
				return;
			}

			const gameRoom = toInternalGameRoom(dbRoom);

			const userId = getUserId();
			if (!userId) return;
			if (gameRoom.turn !== userId) {
				socket.emit("game:error", "Not your turn");
				return;
			}

			if (gameRoom.status !== "playing") {
				socket.emit("game:error", "Game already finished");
				return;
			}

			if (!isValidPath(parsedMove.selection)) {
				socket.emit("game:error", "Invalid path - letters must be adjacent");
				return;
			}

			if (!isValidOwnership(parsedMove.selection, userId)) {
				socket.emit(
					"game:error",
					"Can only select your own or neutral letters",
				);
				return;
			}

			const wordValid = await validateWord(parsedMove.word);
			if (!wordValid) {
				socket.emit("game:error", "Invalid word");
				return;
			}

			const alreadyPlayed = gameRoom.playedWords.some(
				(pw) => pw.word === parsedMove.word && pw.owner === userId,
			);
			if (alreadyPlayed) {
				socket.emit("game:error", "Word already played");
				return;
			}

			const newBase = updateOwnersAndRemoveIsolated(
				parsedMove.selection,
				gameRoom.base,
				gameRoom.board,
				userId,
				gameRoom.player1Id,
			);
			const newPlayedWords = [
				...gameRoom.playedWords,
				{
					word: parsedMove.word,
					owner: userId,
					turn: gameRoom.turnCount,
				},
			];

			const winner = checkWin(
				newBase,
				userId,
				gameRoom.board.length,
				gameRoom.player1Id,
			)
				? userId
				: undefined;

			const nextTurn = winner
				? ""
				: (gameRoom.players.find((p) => p !== userId) ?? "");

			gameRoom.base = newBase;
			gameRoom.playedWords = newPlayedWords;
			gameRoom.turn = nextTurn;
			gameRoom.turnCount++;
			if (winner) {
				gameRoom.status = "finished";
				gameRoom.winner = winner;
			}

			await gameRoomRepository.update(parsedMove.gameId, {
				base: newBase,
				playedWords: newPlayedWords,
				turn: nextTurn,
				turnCount: gameRoom.turnCount,
				status: gameRoom.status,
				winner: gameRoom.winner,
			});
			await gameMoveRepository.create({
				gameId: parsedMove.gameId,
				playerId: userId,
				selection: parsedMove.selection,
				word: parsedMove.word,
				newBase,
				playedWords: newPlayedWords,
				nextTurn,
				winner,
				turnNumber: gameRoom.turnCount,
			});

			const gameMove: GameMove = {
				gameId: parsedMove.gameId,
				playerId: userId,
				selection: parsedMove.selection,
				word: parsedMove.word,
				newBase,
				playedWords: newPlayedWords,
				nextTurn,
				winner,
			};
			io.to(parsedMove.gameId).emit("game:move", gameMove);

			if (winner) {
				const endData = {
					gameId: parsedMove.gameId,
					winner,
					reason: "win" as const,
				};
				io.to(parsedMove.gameId).emit("game:end", endData);
			}
		});

		socket.on("disconnect", async () => {
			const userId = getUserId();
			if (!userId) return;

			const activeGame = await gameRoomRepository.findActiveForUser(userId);
			if (activeGame) {
				const otherPlayer =
					activeGame.player1Id === userId
						? activeGame.player2Id
						: activeGame.player1Id;
				await gameRoomRepository.update(activeGame.id, {
					status: "finished",
					winner: otherPlayer,
				});
				io.to(activeGame.id).emit("game:end", {
					gameId: activeGame.id,
					winner: otherPlayer,
					reason: "disconnect",
				});
			}
		});
	});
};

export default { service };
