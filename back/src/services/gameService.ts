import { gameMoveRepository } from "../db/gameMoveRepository.ts";
import { gameRoomRepository } from "../db/gameRoomRepository.ts";
import type { GameRoom as DbGameRoom } from "../db/schema.ts";
import type {
	GameMove,
	GameStartData,
	GameState,
	LetterData,
	PlayedWordData,
	SocketServer,
} from "../types.ts";
import { validateEvent } from "../validation/boundary.ts";
import {
	ChallengeAcceptArgsSchema,
	ChallengeNewArgsSchema,
	ClientGameMoveSchema,
	GameIdSchema,
} from "../validation/schemas.ts";
import {
	checkWin,
	createGameBoard,
	createInitialBase,
	isValidOwnership,
	isValidPath,
	updateOwnersAndRemoveIsolated,
	validateWord,
} from "./gameLogic.ts";
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

		socket.on(
			"challenge:new",
			validateEvent(
				ChallengeNewArgsSchema,
				socket,
				([challengedID, challengerUsername]) => {
					const userId = getUserId();
					if (!userId) return;
					const challenge = {
						from: userId,
						to: challengedID,
						fromUsername: challengerUsername,
					};
					console.log("new challenge", challenge);
					socket.to(challenge.to).emit("challenge:got", challenge);
				},
			),
		);

		socket.on(
			"challenge:accept",
			validateEvent(
				ChallengeAcceptArgsSchema,
				socket,
				async ([challengerID]) => {
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
				},
			),
		);

		socket.on(
			"game:join",
			validateEvent(GameIdSchema, socket, async (gameId) => {
				const dbRoom = await gameRoomRepository.findById(gameId);
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
			}),
		);

		socket.on(
			"game:move",
			validateEvent(ClientGameMoveSchema, socket, async (parsedMove) => {
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
			}),
		);

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
