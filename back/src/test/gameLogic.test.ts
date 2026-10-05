import { describe, expect, it } from "vitest";

// These are the pure functions from gameService.ts that we want to test
// Since they're not exported, we'll recreate them here for testing
// In a real scenario, you'd either export them or test via the service layer

interface LetterData {
	letter: string;
	row: number;
	column: number;
	owner: string;
	possibleWords?: Array<Array<LetterData>>;
}

const LETTERS =
	"aaaaaaaaaaaaiiiiiiiiiiittttttttttnnnnnnnnneeeeeeeesssssssslllllloooookkkkkuuuuuääääämmmmvvrrjjhhyyppdö".split(
		"",
	);

const createGameBoard = (rows: number, columns: number): string[][] => {
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

describe("Game Logic", () => {
	const player1 = "player1";
	const player2 = "player2";
	const board = [
		["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
		["K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
		["U", "V", "W", "X", "Y", "Z", "A", "B", "C", "D"],
		["E", "F", "G", "H", "I", "J", "K", "L", "M", "N"],
		["O", "P", "Q", "R", "S", "T", "U", "V", "W", "X"],
		["Y", "Z", "A", "B", "C", "D", "E", "F", "G", "H"],
		["I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"],
		["S", "T", "U", "V", "W", "X", "Y", "Z", "A", "B"],
		["C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
		["M", "N", "O", "P", "Q", "R", "S", "T", "U", "V"],
		["W", "X", "Y", "Z", "A", "B", "C", "D", "E", "F"],
		["G", "H", "I", "J", "K", "L", "M", "N", "O", "P"],
	];
	const base = createInitialBase(board, player1, player2);

	describe("createGameBoard", () => {
		it("creates a board with correct dimensions", () => {
			const b = createGameBoard(5, 5);
			expect(b).toHaveLength(5);
			expect(b[0]).toHaveLength(5);
		});

		it("creates a 12x10 board by default", () => {
			const b = createGameBoard(12, 10);
			expect(b).toHaveLength(12);
			expect(b[0]).toHaveLength(10);
		});

		it("fills board with uppercase letters from LETTERS", () => {
			const b = createGameBoard(3, 3);
			const allLetters = b.flat();
			// LETTERS includes Finnish characters (ä, ö) which uppercase to Ä, Ö
			expect(allLetters.every((l) => /^[A-ZÄÖ]$/.test(l))).toBe(true);
		});
	});

	describe("createInitialBase", () => {
		it("creates base with correct size", () => {
			expect(base).toHaveLength(12 * 10);
		});

		it("sets player1 ownership on row 0", () => {
			const row0 = base.filter((b) => b.row === 0);
			expect(row0.every((b) => b.owner === player1)).toBe(true);
		});

		it("sets player2 ownership on last row", () => {
			const lastRow = base.filter((b) => b.row === 11);
			expect(lastRow.every((b) => b.owner === player2)).toBe(true);
		});

		it("sets middle rows to 'none'", () => {
			const middle = base.filter((b) => b.row > 0 && b.row < 11);
			expect(middle.every((b) => b.owner === "none")).toBe(true);
		});

		it("preserves letter positions", () => {
			expect(base[0].letter).toBe("A");
			expect(base[1].letter).toBe("B");
			expect(base[119].letter).toBe("P"); // Last index is 119 (12*10 - 1)
		});
	});

	describe("isValidPath", () => {
		it("returns true for adjacent letters horizontally", () => {
			const selection = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "B", row: 0, column: 1, owner: "none" },
			];
			expect(isValidPath(selection)).toBe(true);
		});

		it("returns true for adjacent letters vertically", () => {
			const selection = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "K", row: 1, column: 0, owner: "none" },
			];
			expect(isValidPath(selection)).toBe(true);
		});

		it("returns true for diagonal adjacency", () => {
			const selection = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "L", row: 1, column: 1, owner: "none" },
			];
			expect(isValidPath(selection)).toBe(true);
		});

		it("returns false for non-adjacent letters", () => {
			const selection = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "C", row: 0, column: 2, owner: "none" },
			];
			expect(isValidPath(selection)).toBe(false);
		});

		it("returns false for single letter", () => {
			const selection = [{ letter: "A", row: 0, column: 0, owner: player1 }];
			expect(isValidPath(selection)).toBe(false);
		});

		it("returns false for empty selection", () => {
			expect(isValidPath([])).toBe(false);
		});

		it("validates entire path chain", () => {
			const selection = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "B", row: 0, column: 1, owner: "none" },
				{ letter: "C", row: 0, column: 2, owner: "none" },
			];
			expect(isValidPath(selection)).toBe(true);
		});

		it("fails on single gap in path", () => {
			const selection = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "B", row: 0, column: 1, owner: "none" },
				{ letter: "D", row: 0, column: 3, owner: "none" }, // gap!
			];
			expect(isValidPath(selection)).toBe(false);
		});
	});

	describe("isValidOwnership", () => {
		it("returns true for all player-owned letters", () => {
			const selection = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "B", row: 0, column: 1, owner: player1 },
			];
			expect(isValidOwnership(selection, player1)).toBe(true);
		});

		it("returns true for neutral letters", () => {
			const selection = [
				{ letter: "K", row: 1, column: 0, owner: "none" },
				{ letter: "L", row: 1, column: 1, owner: "none" },
			];
			expect(isValidOwnership(selection, player1)).toBe(true);
		});

		it("returns true for mix of player and neutral", () => {
			const selection = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "K", row: 1, column: 0, owner: "none" },
			];
			expect(isValidOwnership(selection, player1)).toBe(true);
		});

		it("returns false for opponent letters", () => {
			const selection = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "G", row: 11, column: 0, owner: player2 },
			];
			expect(isValidOwnership(selection, player1)).toBe(false);
		});

		it("returns false for mixed player and opponent", () => {
			const selection = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "G", row: 11, column: 0, owner: player2 },
				{ letter: "K", row: 1, column: 0, owner: "none" },
			];
			expect(isValidOwnership(selection, player1)).toBe(false);
		});
	});

	describe("checkWin", () => {
		it("returns true when player1 reaches bottom row", () => {
			const winningBase = base.map((b) =>
				b.row === 11 && b.column === 0 ? { ...b, owner: player1 } : b,
			);
			expect(checkWin(winningBase, player1, 12, player1)).toBe(true);
		});

		it("returns true when player2 reaches top row", () => {
			const winningBase = base.map((b) =>
				b.row === 0 && b.column === 0 ? { ...b, owner: player2 } : b,
			);
			expect(checkWin(winningBase, player2, 12, player1)).toBe(true);
		});

		it("returns false when player hasn't reached target row", () => {
			expect(checkWin(base, player1, 12, player1)).toBe(false);
		});

		it("returns false for player at wrong edge", () => {
			const base2 = base.map((b) =>
				b.row === 0 && b.column === 0 ? { ...b, owner: player1 } : b,
			);
			// player1 at top row (their own base) is not a win
			expect(checkWin(base2, player1, 12, player1)).toBe(false);
		});
	});

	describe("generateMovements / getNeighborsData", () => {
		const movements = generateMovements(board);

		it("generates movements for all cells", () => {
			expect(Object.keys(movements)).toHaveLength(120);
		});

		it("center cell has 8 neighbors", () => {
			const neighbors = movements["5,5"];
			expect(neighbors).toHaveLength(8);
		});

		it("corner cell has 3 neighbors", () => {
			const neighbors = movements["0,0"];
			expect(neighbors).toHaveLength(3);
		});

		it("edge cell has 5 neighbors", () => {
			const neighbors = movements["0,5"];
			expect(neighbors).toHaveLength(5);
		});

		it("neighbors have correct coordinates", () => {
			const neighbors = movements["0,0"];
			const coords = neighbors.map((n) => `${n.row},${n.column}`).sort();
			expect(coords).toEqual(["0,1", "1,0", "1,1"]);
		});

		it("neighbors include correct letters", () => {
			const neighbors = movements["0,0"];
			const letters = neighbors.map((n) => n.letter).sort();
			expect(letters).toEqual(["B", "K", "L"]);
		});
	});
});
