import { beforeEach, describe, expect, it, vi } from "vitest";
import { sessionRepository } from "../db/sessionRepository.ts";
import { sessionStore } from "./sessionService.ts";

vi.mock("../db/sessionRepository.ts", () => ({
	sessionRepository: {
		findById: vi.fn(),
		findByUserId: vi.fn(),
		save: vi.fn(),
		findAll: vi.fn(),
		findAllBut: vi.fn(),
		setConnected: vi.fn(),
		delete: vi.fn(),
	},
}));

const mockSessionRepository = vi.mocked(sessionRepository);

describe("sessionStore", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("findSession", () => {
		it("returns session when found", async () => {
			const mockSession = {
				id: "session1",
				userId: "user1",
				username: "testuser",
				connected: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			mockSessionRepository.findById.mockResolvedValue(mockSession);

			const result = await sessionStore.findSession("session1");

			expect(result).toEqual({
				userID: "user1",
				username: "testuser",
				connected: true,
			});
			expect(mockSessionRepository.findById).toHaveBeenCalledWith("session1");
		});

		it("returns undefined when not found", async () => {
			mockSessionRepository.findById.mockResolvedValue(undefined);

			const result = await sessionStore.findSession("nonexistent");

			expect(result).toBeUndefined();
		});
	});

	describe("findSessionByUserId", () => {
		it("returns session when found", async () => {
			const mockSession = {
				id: "session1",
				userId: "user1",
				username: "testuser",
				connected: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			mockSessionRepository.findByUserId.mockResolvedValue(mockSession);

			const result = await sessionStore.findSessionByUserId("user1");

			expect(result).toEqual({
				userID: "user1",
				username: "testuser",
				connected: true,
			});
			expect(mockSessionRepository.findByUserId).toHaveBeenCalledWith("user1");
		});

		it("returns undefined when not found", async () => {
			mockSessionRepository.findByUserId.mockResolvedValue(undefined);

			const result = await sessionStore.findSessionByUserId("nonexistent");

			expect(result).toBeUndefined();
		});
	});

	describe("saveSession", () => {
		it("saves session with correct mapping", async () => {
			mockSessionRepository.save.mockResolvedValue(undefined);

			await sessionStore.saveSession("session1", {
				userID: "user1",
				username: "testuser",
				connected: true,
			});

			expect(mockSessionRepository.save).toHaveBeenCalledWith({
				id: "session1",
				userId: "user1",
				username: "testuser",
				connected: true,
			});
		});
	});

	describe("findAllSessions", () => {
		it("returns all sessions mapped correctly", async () => {
			const mockSessions = [
				{
					id: "session1",
					userId: "user1",
					username: "user1",
					connected: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "session2",
					userId: "user2",
					username: "user2",
					connected: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];
			mockSessionRepository.findAll.mockResolvedValue(mockSessions);

			const result = await sessionStore.findAllSessions();

			expect(result).toEqual([
				{ userID: "user1", username: "user1", connected: true },
				{ userID: "user2", username: "user2", connected: false },
			]);
		});

		it("returns empty array when no sessions", async () => {
			mockSessionRepository.findAll.mockResolvedValue([]);

			const result = await sessionStore.findAllSessions();

			expect(result).toEqual([]);
		});
	});

	describe("findAllBut", () => {
		it("returns all sessions except excluded", async () => {
			const mockSessions = [
				{
					id: "session1",
					userId: "user1",
					username: "user1",
					connected: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "session2",
					userId: "user2",
					username: "user2",
					connected: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];
			mockSessionRepository.findAllBut.mockResolvedValue(mockSessions);

			const result = await sessionStore.findAllBut("session1");

			expect(result).toEqual([
				{ userID: "user1", username: "user1", connected: true },
				{ userID: "user2", username: "user2", connected: true },
			]);
			expect(mockSessionRepository.findAllBut).toHaveBeenCalledWith("session1");
		});
	});
});
