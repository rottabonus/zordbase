import { describe, expect, it } from "vitest";
import type { LetterData } from "../types.ts";
import {
	checkWin,
	createGameBoard,
	createInitialBase,
	generateMovements,
	isValidOwnership,
	isValidPath,
	updateOwnersAndRemoveIsolated,
} from "./gameLogic.ts";

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
			const selection: LetterData[] = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "B", row: 0, column: 1, owner: "none" },
			];
			expect(isValidPath(selection)).toBe(true);
		});

		it("returns true for adjacent letters vertically", () => {
			const selection: LetterData[] = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "K", row: 1, column: 0, owner: "none" },
			];
			expect(isValidPath(selection)).toBe(true);
		});

		it("returns true for diagonal adjacency", () => {
			const selection: LetterData[] = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "L", row: 1, column: 1, owner: "none" },
			];
			expect(isValidPath(selection)).toBe(true);
		});

		it("returns false for non-adjacent letters", () => {
			const selection: LetterData[] = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "C", row: 0, column: 2, owner: "none" },
			];
			expect(isValidPath(selection)).toBe(false);
		});

		it("returns false for single letter", () => {
			const selection: LetterData[] = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
			];
			expect(isValidPath(selection)).toBe(false);
		});

		it("returns false for empty selection", () => {
			expect(isValidPath([])).toBe(false);
		});

		it("validates entire path chain", () => {
			const selection: LetterData[] = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "B", row: 0, column: 1, owner: "none" },
				{ letter: "C", row: 0, column: 2, owner: "none" },
			];
			expect(isValidPath(selection)).toBe(true);
		});

		it("fails on single gap in path", () => {
			const selection: LetterData[] = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "B", row: 0, column: 1, owner: "none" },
				{ letter: "D", row: 0, column: 3, owner: "none" }, // gap!
			];
			expect(isValidPath(selection)).toBe(false);
		});
	});

	describe("isValidOwnership", () => {
		it("returns true for all player-owned letters", () => {
			const selection: LetterData[] = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "B", row: 0, column: 1, owner: player1 },
			];
			expect(isValidOwnership(selection, player1)).toBe(true);
		});

		it("returns true for neutral letters", () => {
			const selection: LetterData[] = [
				{ letter: "K", row: 1, column: 0, owner: "none" },
				{ letter: "L", row: 1, column: 1, owner: "none" },
			];
			expect(isValidOwnership(selection, player1)).toBe(true);
		});

		it("returns true for mix of player and neutral", () => {
			const selection: LetterData[] = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "K", row: 1, column: 0, owner: "none" },
			];
			expect(isValidOwnership(selection, player1)).toBe(true);
		});

		it("returns false for opponent letters", () => {
			const selection: LetterData[] = [
				{ letter: "A", row: 0, column: 0, owner: player1 },
				{ letter: "G", row: 11, column: 0, owner: player2 },
			];
			expect(isValidOwnership(selection, player1)).toBe(false);
		});

		it("returns false for mixed player and opponent", () => {
			const selection: LetterData[] = [
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

	describe("updateOwnersAndRemoveIsolated", () => {
		it("updates ownership for selected cells", () => {
			const selection: LetterData[] = [
				{ letter: "K", row: 1, column: 0, owner: "none" },
				{ letter: "L", row: 1, column: 1, owner: "none" },
			];
			const updated = updateOwnersAndRemoveIsolated(
				selection,
				base,
				board,
				player1,
				player1,
			);
			expect(updated[10].owner).toBe(player1); // row 1, col 0
			expect(updated[11].owner).toBe(player1); // row 1, col 1
		});

		it("removes isolated opponent pieces", () => {
			// Create a base where player2 has an isolated piece
			const baseWithIsolated = base.map((b) => {
				if (b.row === 5 && b.column === 5) {
					return { ...b, owner: player2 };
				}
				return b;
			});

			const selection: LetterData[] = [
				{ letter: "K", row: 1, column: 0, owner: "none" },
			];
			const updated = updateOwnersAndRemoveIsolated(
				selection,
				baseWithIsolated,
				board,
				player1,
				player1,
			);
			// The isolated player2 piece at (5,5) should become "none"
			const idx = 5 * 10 + 5;
			expect(updated[idx].owner).toBe("none");
		});

		it("keeps connected opponent pieces", () => {
			// Create a base where player2 has a connected piece at bottom row
			const baseWithConnected = base.map((b) => {
				if (b.row === 11 && b.column === 5) {
					return { ...b, owner: player2 };
				}
				return b;
			});

			const selection: LetterData[] = [
				{ letter: "K", row: 1, column: 0, owner: "none" },
			];
			const updated = updateOwnersAndRemoveIsolated(
				selection,
				baseWithConnected,
				board,
				player1,
				player1,
			);
			// The connected player2 piece at (11,5) should remain player2
			const idx = 11 * 10 + 5;
			expect(updated[idx].owner).toBe(player2);
		});
	});
});
