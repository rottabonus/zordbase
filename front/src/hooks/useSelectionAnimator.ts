import { useCallback } from "react";
import { useDispatch } from "react-redux";
import allActions from "../actions/allActions";
import type { letterObject } from "../types/types";

/**
 * Reveals a word selection one letter at a time (500ms apart), used to
 * animate both the computer's move (singleplayer) and an opponent's move
 * echoed back from the server (multiplayer).
 */
export const useSelectionAnimator = () => {
	const dispatch = useDispatch();

	return useCallback(
		(selection: letterObject[]) => {
			for (const [i, _s] of selection.entries()) {
				const selectionArray = selection.filter((_s, j) => j <= i);
				setTimeout(
					() => {
						dispatch(allActions.baseActions.updateSelection(selectionArray));
					},
					(i + 1) * 500,
				);
			}
		},
		[dispatch],
	);
};
