import { describe, expect, it } from "vitest";
import wordService from "./wordService.ts";

describe("wordService", () => {
	it("getEntries returns the word list", () => {
		const entries = wordService.getEntries();
		expect(entries).toBeDefined();
		expect(typeof entries).toBe("object");
		expect(Object.keys(entries).length).toBeGreaterThan(0);
	});

	it("getEntries returns same reference on multiple calls", () => {
		const entries1 = wordService.getEntries();
		const entries2 = wordService.getEntries();
		expect(entries1).toBe(entries2);
	});
});
