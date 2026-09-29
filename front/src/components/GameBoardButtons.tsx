import type React from "react";
import { useSelector } from "react-redux";
import { selectBase } from "../reducers/baseReducer";
import { selectBoard } from "../reducers/boardReducer";

interface BoardButtonProps {
	confirmSelection: () => void;
	removeSelection: () => void;
	newGame: () => void;
	resetGame: (board: string[][]) => void;
	disabled?: boolean;
}

const Button: React.FC<{
	children: React.ReactNode;
	onClick: () => void;
	visible: boolean;
	disabled?: boolean;
	"aria-label": string;
}> = ({ children, onClick, visible, disabled, "aria-label": ariaLabel }) => (
	<button
		type="button"
		className="gameboard-btn"
		onClick={onClick}
		disabled={disabled || !visible}
		style={{ display: visible ? "inline-flex" : "none" }}
		aria-label={ariaLabel}
	>
		{children}
	</button>
);

export const GameBoardButtons: React.FC<BoardButtonProps> = (props) => {
	const { board, isLoading } = useSelector(selectBoard);
	const { selection: selected } = useSelector(selectBase);
	const { disabled } = props;

	const isActionVisible = selected.length > 0 && !disabled;
	const isLoadingVisible = !isLoading && !disabled;

	return (
		<div className="gameboard-button-div">
			<Button
				onClick={props.newGame}
				visible={isLoadingVisible}
				disabled={disabled}
				aria-label="New game"
			>
				<i className="fa fa-plus-circle" aria-hidden="true" />
				<span className="helptext">New game</span>
			</Button>
			<Button
				onClick={props.confirmSelection}
				visible={isActionVisible}
				disabled={disabled}
				aria-label="Confirm selection"
			>
				<i className="fa fa-chevron-circle-down" aria-hidden="true" />
				<span className="helptext">Confirm selection</span>
			</Button>
			<Button
				onClick={props.removeSelection}
				visible={isActionVisible}
				disabled={disabled}
				aria-label="Remove selection"
			>
				<i className="fa fa-times-circle-o" aria-hidden="true" />
				<span className="helptext">Remove selection</span>
			</Button>
			<Button
				onClick={() => props.resetGame(board)}
				visible={isLoadingVisible}
				disabled={disabled}
				aria-label="Reset game"
			>
				<i className="fa fa-refresh" aria-hidden="true" />
				<span className="helptext">Reset game</span>
			</Button>
		</div>
	);
};
