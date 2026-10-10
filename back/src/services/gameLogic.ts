import {
	createGameBoard,
	generateMovements,
} from "../../../shared/boardLogic.ts";
import type { LetterData } from "../types.ts";

export { createGameBoard, generateMovements };

export const createInitialBase = (
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

export const validateWord = async (word: string): Promise<boolean> => {
	return word.length >= 2;
};

export const isValidPath = (selection: LetterData[]): boolean => {
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

export const isValidOwnership = (
	selection: LetterData[],
	playerId: string,
): boolean => {
	return selection.every((s) => s.owner === playerId || s.owner === "none");
};

export const checkWin = (
	base: LetterData[],
	playerId: string,
	boardRows: number,
	player1Id: string,
): boolean => {
	const targetRowForPlayer = playerId === player1Id ? boardRows - 1 : 0;
	return base.some((b) => b.owner === playerId && b.row === targetRowForPlayer);
};

export const updateOwnersAndRemoveIsolated = (
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
