import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import { storageService } from "../services/storageService";
import type {
	GameClientToServerEvents,
	GameServerToClientEvents,
	LobbyClientToServerEvents,
	LobbyServerToClientEvents,
} from "../types/types";

// Union of all server-to-client events
type AllServerToClientEvents = LobbyServerToClientEvents &
	GameServerToClientEvents;
// Union of all client-to-server events
type AllClientToServerEvents = LobbyClientToServerEvents &
	GameClientToServerEvents;

interface SocketContextValue {
	socket: Socket<AllServerToClientEvents, AllClientToServerEvents> | null;
	isConnected: boolean;
	connect: (auth?: Record<string, unknown>) => void;
	disconnect: () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
	children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
	const [socket, setSocket] = useState<Socket<
		AllServerToClientEvents,
		AllClientToServerEvents
	> | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	// Initialize socket once
	useEffect(() => {
		const newSocket = io("http://localhost:3000", {
			autoConnect: false,
		}) as Socket<AllServerToClientEvents, AllClientToServerEvents>;

		newSocket.on("connect", () => {
			console.log("Socket connected");
			setIsConnected(true);
		});

		newSocket.on("disconnect", () => {
			console.log("Socket disconnected");
			setIsConnected(false);
		});

		newSocket.on("connect_error", (error: Error) => {
			console.error("Socket connection error:", error);
			setIsConnected(false);
		});

		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
			newSocket.off("connect");
			newSocket.off("disconnect");
			newSocket.off("connect_error");
		};
	}, []);

	const connect = useCallback(
		(auth?: Record<string, unknown>) => {
			if (socket) {
				if (auth) {
					socket.auth = { ...socket.auth, ...auth };
				}
				console.log("Socket connect() called");
				socket.connect();
			}
		},
		[socket],
	);

	const disconnect = useCallback(() => {
		if (socket) {
			console.log("Socket disconnect() called");
			socket.disconnect();
			setIsConnected(false);
		}
	}, [socket]);

	// Auto-connect on mount if session exists
	useEffect(() => {
		if (socket) {
			const session = storageService.getItem("session");
			if (session) {
				try {
					const parsed = JSON.parse(session);
					if (parsed.sessionID && parsed.userID) {
						socket.auth = { sessionID: parsed.sessionID };
						console.log(
							"Auto-connecting with restored session:",
							parsed.userID,
						);
						socket.connect();
					}
				} catch {
					// Invalid session data, ignore
				}
			}
		}
	}, [socket]);

	const value = useMemo(
		() => ({
			socket,
			isConnected,
			connect,
			disconnect,
		}),
		[socket, isConnected, connect, disconnect],
	);

	return (
		<SocketContext.Provider value={value}>{children}</SocketContext.Provider>
	);
};

export const useSocket = (): SocketContextValue => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocket must be used within a SocketProvider");
	}
	return context;
};
