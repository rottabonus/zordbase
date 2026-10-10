import { useCallback } from "react";
import { useDispatch } from "react-redux";
import allActions from "../actions/allActions";
import type { letterObject, playedWord } from "../types/types";
import { useSelectionAnimator } from "./useSelectionAnimator";

interface ApplyMoveArgs {
	preMoveBase: letterObject[];
	selection: letterObject[];
	historyTurnLabel: string;
	newBase: letterObject[];
	playedWords: playedWord[];
	/** Runs right after the base/playedWords are confirmed (win-handling, turn change, etc). */
	onComplete: () => void;
}

/**
 * Shared "reveal then apply" sequence for a move that isn't the local
 * player's own live selection: records history, animates the selection
 * letter-by-letter, then confirms the resulting base/playedWords once the
 * animation finishes. Used by the computer's turn (singleplayer) and an
 * echoed/opponent move (multiplayer) - the human's own move is confirmed
 * immediately with no animation, so it doesn't go through this.
 */
export const useAnimatedMove = () => {
	const dispatch = useDispatch();
	const animateSelection = useSelectionAnimator();

	return useCallback(
		({
			preMoveBase,
			selection,
			historyTurnLabel,
			newBase,
			playedWords,
			onComplete,
		}: ApplyMoveArgs) => {
			dispatch(
				allActions.baseActions.createHistory(
					preMoveBase,
					selection,
					historyTurnLabel,
				),
			);
			animateSelection(selection);
			const animationDuration = selection.length * 500 + 700;
			setTimeout(() => {
				dispatch(
					allActions.baseActions.confirmSelection(newBase, playedWords, []),
				);
				onComplete();
			}, animationDuration);
		},
		[dispatch, animateSelection],
	);
};
