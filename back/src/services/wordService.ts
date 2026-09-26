import wordData from "../../../words/words.json" with { type: "json" };

import type { Words } from "../types.ts";

const words: Words = wordData;

const getEntries = (): Words => {
	return words;
};

export default {
	getEntries,
};
