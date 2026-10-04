import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { legacy_createStore as createStore } from "redux";
import { Board } from "../components/Board";
import rootReducer from "../reducers/combineReducer";

// Mock selectLetter
const mockSelectLetter = vi.fn();

// Create a test store with initial state
const createTestStore = () => {
	return createStore(rootReducer, {
		board: {
			board: Array(12).fill(null).map(() => Array(10).fill("A")),
			newGame: true,
			turn: "player1",
			isLoading: false,
		},
		base: {
			base: Array(120).fill(null).map((_, i) => ({
				letter: "A",
				row: Math.floor(i / 10),
				column: i % 10,
				owner: i < 10 ? "player1" : i >= 110 ? "player2" : "none",
			})),
			selection: [],
			playedWords: [],
			playerName: "player1",
			possibleWordPositions: {},
			stateHistory: [{ base: [], selection: [], turn: "player1" }],
		},
		message: { message: "", type: "", show: false, resolution: false },
		multiplayer: { gameState: null, isConnected: false, error: null },
	});
};

const renderWithStore = (ui: React.ReactElement) => {
	const store = createTestStore();
	return render(<Provider store={store}>{ui}</Provider>);
};

describe("Board", () => {
	it("renders a 12x10 grid of cells", () => {
		const { container } = renderWithStore(
			<Board
				selectLetter={mockSelectLetter}
				myUserId="player1"
				opponentId="player2"
			 />,
		);

		const cells = container.querySelectorAll("td");
		expect(cells).toHaveLength(120);
	});

	it("calls selectLetter when a cell is clicked", () => {
		renderWithStore(
			<Board
				selectLetter={mockSelectLetter}
				myUserId="player1"
				opponentId="player2"
			 />,
		);

		const firstCell = screen.getByRole("button", { name: "A at row 1, column 1" });
		firstCell.click();

		expect(mockSelectLetter).toHaveBeenCalledWith(
			"A", // letter at [0,0]
			0, // row
			0, // column
			"player1", // owner at row 0
		);
	});

	it("applies correct styling based on ownership", () => {
		const { container } = renderWithStore(
			<Board
				selectLetter={mockSelectLetter}
				myUserId="player1"
				opponentId="player2"
			 />,
		);

		const cells = container.querySelectorAll("td");
		expect(cells).toHaveLength(120);

		// First row should have player1 ownership (blue-ish color)
		const firstRowCells = Array.from(cells).slice(0, 10);
		firstRowCells.forEach((cell) => {
			expect(cell).toHaveStyle({ backgroundColor: "rgb(135, 182, 184)" });
		});

		// Last row should have player2 ownership (khaki color)
		const lastRowCells = Array.from(cells).slice(110);
		lastRowCells.forEach((cell) => {
			expect(cell).toHaveStyle({ backgroundColor: "rgb(240, 230, 140)" });
		});
	});
});