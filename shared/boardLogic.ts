import type { LetterData } from "./schemas.ts";

// Single source of truth for board generation and adjacency logic, used by
// the server (authoritative move validation) and the frontend (optimistic
// UI in both singleplayer's local gameplay and the AI word-finder worker).

export const LETTERS =
	"aaaaaaaaaaaaiiiiiiiiiiittttttttttnnnnnnnnneeeeeeeesssssssslllllloooookkkkkuuuuuääääämmmmvvrrjjhhyyppdö".split(
		"",
	);

export const createGameBoard = (rows: number, columns: number): string[][] => {
	const toArray = (num: number) => Array.from(Array(num).keys());
	const getRandomFrom = (arr: string[]) =>
		arr[Math.floor(Math.random() * arr.length)];
	return toArray(rows).map(() =>
		toArray(columns).map(() => getRandomFrom(LETTERS).toUpperCase()),
	);
};

export const generateMovements = (
	board: string[][],
): Record<string, LetterData[]> => {
	const moves: Record<string, LetterData[]> = {};
	board.forEach((row, r) => {
		row.forEach((_column, c) => {
			moves[`${r},${c}`] = getNeighborsData(
				{ letter: board[r][c], row: r, column: c, owner: "none" },
				board,
			);
		});
	});
	return moves;
};

export const getNeighborsData = (
	node: LetterData,
	board: string[][],
): LetterData[] => {
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
