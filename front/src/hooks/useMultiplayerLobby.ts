import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { storageService } from "../services/storageService";
import type { Challenge, GameStartData, Session, User } from "../types/types";

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

	// Refs for callbacks to avoid stale closures
	const onGameStartRef = useRef(onGameStart);
	useEffect(() => {
		onGameStartRef.current = onGameStart;
	}, [onGameStart]);

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

	// Event handlers for lobby
	useEffect(() => {
		if (!socket) return;

		const handleSessionSet = (newSession: Session) => {
			setSession(newSession);
			storageService.setItem("session", JSON.stringify(newSession));
			handleSessionRestore(newSession);
		};

		const handleUsersList = (usersList: User[]) => {
			console.log("initial users", usersList);
			setUsers(usersList.filter((user) => user.connected));
		};

		const handleUserConnected = (user: User) => {
			console.log("userconnected", user);
			setUsers((prevUsers) => [...prevUsers, user]);
		};

		const handleUserDisconnected = (id: string) => {
			console.log("disconnected", id);
			setUsers((prevUsers) =>
				prevUsers.filter((user) => user.userID !== id && user.connected),
			);
		};

		const handleChallengeGot = (challenge: Challenge) => {
			console.log("you got challenged", challenge);
			setIncomingChallenge(challenge);
		};

		const handleGameStart = (data: GameStartData) => {
			console.log("game starting", data);
			onGameStartRef.current?.(data);
		};

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
	}, [socket, handleSessionRestore]);

	// Challenge actions
	const challenge = useCallback(
		(userId: string) => {
			console.log("challenge sent to ", userId);
			socket?.emit("challenge:new", userId, name);
		},
		[socket, name],
	);

	const acceptChallenge = useCallback(
		(challengerId: string) => {
			socket?.emit("challenge:accept", challengerId, name);
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
