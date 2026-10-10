import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import allActions from "../actions/allActions";
import { selectMessage } from "../reducers/messageReducer";

/**
 * Reset/start confirmation-modal boilerplate shared by singleplayer and
 * multiplayer board pages. What `startNewGame`/`resetGame` actually do
 * differs per mode (local re-init vs. reading from server game state), so
 * only the modal-trigger/dismiss plumbing lives here.
 */
export const useGameModals = () => {
	const dispatch = useDispatch();
	const { type: messageType } = useSelector(selectMessage);

	const showResetModal = useCallback(() => {
		dispatch(
			allActions.messageActions.setMessage(
				"are you sure you want to reset the game?",
				"reset",
			),
		);
	}, [dispatch]);

	const showStartModal = useCallback(() => {
		dispatch(
			allActions.messageActions.setMessage(
				"are you sure you want to start new game?",
				"start",
			),
		);
	}, [dispatch]);

	const clearMessage = useCallback(() => {
		dispatch(allActions.messageActions.clearMessage());
	}, [dispatch]);

	// Used at the end of startNewGame: dismiss the "start new game?" modal
	// now that the new game has actually started.
	const clearStartModal = useCallback(() => {
		if (messageType === "start") {
			dispatch(allActions.messageActions.clearMessage());
		}
	}, [dispatch, messageType]);

	return { showResetModal, showStartModal, clearMessage, clearStartModal };
};
