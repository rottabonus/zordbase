import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import allActions from "../actions/allActions";
import type { Turn } from "../types/types";
import { useSelectionAnimator } from "./useSelectionAnimator";

/**
 * Replays a past selection from stateHistory, then restores the live base.
 * Guards against re-entrant calls: clicking another played word while a
 * replay is still animating used to capture the already-overwritten
 * "history" base as if it were "present", so whichever replay's timer
 * fired last would restore the wrong state. While `isTimeTraveling` is
 * true, further calls are ignored instead.
 */
export const useTimeTravel = (base: Turn["base"], stateHistory: Turn[]) => {
	const dispatch = useDispatch();
	const animateSelection = useSelectionAnimator();
	const [isTimeTraveling, setIsTimeTraveling] = useState(false);

	const timeTravel = useCallback(
		(turnIndex: number) => {
			if (isTimeTraveling) return;
			const historyEntry = stateHistory[turnIndex];
			if (!historyEntry) return;

			setIsTimeTraveling(true);
			const currentBase = [...base];
			const timeOutCounter = historyEntry.selection.length;
			dispatch(allActions.baseActions.updateBase(historyEntry.base));
			animateSelection(historyEntry.selection);
			setTimeout(
				() => {
					dispatch(allActions.baseActions.updateBase(currentBase));
					dispatch(allActions.baseActions.removeFromSelection(0));
					setIsTimeTraveling(false);
				},
				timeOutCounter * 500 + 700,
			);
		},
		[base, stateHistory, dispatch, animateSelection, isTimeTraveling],
	);

	return { timeTravel, isTimeTraveling };
};
