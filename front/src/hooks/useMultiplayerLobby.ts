import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { storageService } from "../services/storageService";
import type { Challenge, GameStartData, Session, User } from "../types/types";
import {
	ChallengeAcceptArgsSchema,
	ChallengeNewArgsSchema,
} from "../validation/schemas";
import {
	emitValidated,
	parseChallenge,
	parseGameStart,
	parseSession,
	parseUser,
	parseUserId,
	parseUsersList,
} from "../validation/socketValidators";

interface UseMultiplayerLobbyOptions {
	onSessionRestore?: (session: Session) => void;
	onGameStart?: (data: GameStartData) => void;
}

interface UseMultiplayerLobbyReturn {
	users: User[];
	session: Session | null;
	error: string | null;
	name: string;
	setName: (name: string) => void;
	incomingChallenge: Challenge | null;
	connect: (username: string) => void;
	disconnect: () => void;
	challenge: (userId: string) => void;
	acceptChallenge: (challengerId: string) => void;
	declineChallenge: () => void;
	isConnected: boolean;
}

export const useMultiplayerLobby = ({
	onSessionRestore,
	onGameStart,
}: UseMultiplayerLobbyOptions = {}): UseMultiplayerLobbyReturn => {
	const { socket, isConnected, connect, disconnect } = useSocket();

	const [users, setUsers] = useState<User[]>([]);
	const [session, setSession] = useState<Session | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [name, setName] = useState<string>(
		Math.random().toString(36).slice(2, 7),
	);
	const [incomingChallenge, setIncomingChallenge] = useState<Challenge | null>(
		null,
	);

	// Session restore handler
	const handleSessionRestore = useCallback(
		(restoredSession: Session) => {
			setSession(restoredSession);
			storageService.setItem("session", JSON.stringify(restoredSession));
			onSessionRestore?.(restoredSession);
		},
		[onSessionRestore],
	);

	// Connect with username
	const handleConnect = useCallback(
		(username: string) => {
			setError(null);
			connect({ username });
		},
		[connect],
	);

	// Event handlers defined with useCallback to avoid stale closures.
	// Each one validates its payload first, before touching any state.
	const handleSessionSet = useCallback(
		(data: unknown) => {
			const parsed = parseSession(data);
			if (!parsed.success || !parsed.data) {
				console.error(parsed.error);
				return;
			}
			const newSession: Session = parsed.data;
			setSession(newSession);
			storageService.setItem("session", JSON.stringify(newSession));
			handleSessionRestore(newSession);
		},
		[handleSessionRestore],
	);

	const handleUsersList = useCallback((data: unknown) => {
		const parsed = parseUsersList(data);
		if (!parsed.success || !parsed.data) {
			console.error(parsed.error);
			return;
		}
		console.log("initial users", parsed.data);
		setUsers((parsed.data as User[]).filter((user) => user.connected));
	}, []);

	const handleUserConnected = useCallback((data: unknown) => {
		const parsed = parseUser(data);
		if (!parsed.success || !parsed.data) {
			console.error(parsed.error);
			return;
		}
		console.log("userconnected", parsed.data);
		setUsers((prevUsers) => [...prevUsers, parsed.data as User]);
	}, []);

	const handleUserDisconnected = useCallback((data: unknown) => {
		const parsed = parseUserId(data);
		if (!parsed.success || !parsed.data) {
			console.error(parsed.error);
			return;
		}
		const id = parsed.data;
		console.log("disconnected", id);
		setUsers((prevUsers) =>
			prevUsers.filter((user) => user.userID !== id && user.connected),
		);
	}, []);

	const handleChallengeGot = useCallback((data: unknown) => {
		const parsed = parseChallenge(data);
		if (!parsed.success || !parsed.data) {
			console.error(parsed.error);
			return;
		}
		console.log("you got challenged", parsed.data);
		setIncomingChallenge(parsed.data as Challenge);
	}, []);

	const handleGameStart = useCallback(
		(data: unknown) => {
			const parsed = parseGameStart(data);
			if (!parsed.success || !parsed.data) {
				console.error(parsed.error);
				return;
			}
			console.log("game starting", parsed.data);
			onGameStart?.(parsed.data as GameStartData);
		},
		[onGameStart],
	);

	// Event handlers for lobby
	useEffect(() => {
		if (!socket) return;

		socket.on("session:set", handleSessionSet);
		socket.on("users:list", handleUsersList);
		socket.on("user:connected", handleUserConnected);
		socket.on("user:disconnected", handleUserDisconnected);
		socket.on("challenge:got", handleChallengeGot);
		socket.on("game:start", handleGameStart);

		return () => {
			socket.off("session:set", handleSessionSet);
			socket.off("users:list", handleUsersList);
			socket.off("user:connected", handleUserConnected);
			socket.off("user:disconnected", handleUserDisconnected);
			socket.off("challenge:got", handleChallengeGot);
			socket.off("game:start", handleGameStart);
		};
	}, [
		socket,
		handleSessionSet,
		handleUsersList,
		handleUserConnected,
		handleUserDisconnected,
		handleChallengeGot,
		handleGameStart,
	]);

	// Challenge actions
	const challenge = useCallback(
		(userId: string) => {
			console.log("challenge sent to ", userId);
			emitValidated(socket, "challenge:new", ChallengeNewArgsSchema, [
				userId,
				name,
			]);
		},
		[socket, name],
	);

	const acceptChallenge = useCallback(
		(challengerId: string) => {
			emitValidated(socket, "challenge:accept", ChallengeAcceptArgsSchema, [
				challengerId,
				name,
			]);
			setIncomingChallenge(null);
		},
		[socket, name],
	);

	const declineChallenge = useCallback(() => {
		setIncomingChallenge(null);
	}, []);

	return {
		users,
		session,
		error,
		name,
		setName,
		incomingChallenge,
		connect: handleConnect,
		disconnect,
		challenge,
		acceptChallenge,
		declineChallenge,
		isConnected,
	};
};
