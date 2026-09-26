import wordData from "../../../words/words.json";

import type { Words } from "../types";

const words: Words = wordData;

const getEntries = (): Words => {
	return words;
};

export default {
	getEntries,
};
