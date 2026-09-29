import type React from "react";
import { useSelector } from "react-redux";
import { selectMessage } from "../reducers/messageReducer";

interface MessageProps {
	resetGame: () => void;
	clearMessage: () => void;
	startNewGame: () => void;
}

export const Message: React.FC<MessageProps> = (props) => {
	const { type: messageType, message, show } = useSelector(selectMessage);

	const handleKeyDown = (
		handler: () => void,
		e: React.KeyboardEvent<HTMLButtonElement>,
	) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handler();
		}
	};

	return show ? (
		<div className="modal">
			<div className="modalText">
				<span>{message}</span>
			</div>

			{messageType === "reset" ? (
				<div className="modalButtons">
					<div>
						<button
							type="button"
							onClick={props.resetGame}
							onKeyDown={(e) => handleKeyDown(props.resetGame, e)}
						>
							Confirm
						</button>
					</div>
					<div>
						<button
							type="button"
							onClick={props.clearMessage}
							onKeyDown={(e) => handleKeyDown(props.clearMessage, e)}
						>
							Cancel
						</button>
					</div>
				</div>
			) : messageType === "start" ? (
				<div className="modalButtons">
					<div>
						<button
							type="button"
							onClick={props.startNewGame}
							onKeyDown={(e) => handleKeyDown(props.startNewGame, e)}
						>
							Confirm
						</button>
					</div>
					<div>
						<button
							type="button"
							onClick={props.clearMessage}
							onKeyDown={(e) => handleKeyDown(props.clearMessage, e)}
						>
							Cancel
						</button>
					</div>
				</div>
			) : (
				<div className="modalButtons">
					<div>
						<button
							type="button"
							onClick={props.clearMessage}
							onKeyDown={(e) => handleKeyDown(props.clearMessage, e)}
						>
							OK
						</button>
					</div>
				</div>
			)}
		</div>
	) : null;
};
