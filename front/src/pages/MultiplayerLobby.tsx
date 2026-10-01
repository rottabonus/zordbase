import * as React from "react";
import { useNavigate } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import { ChallengeModal } from "../components/ChallengeModal";
import { storageService } from "../services/storageService";
import type {
	Challenge,
	LobbyClientToServerEvents,
	LobbyServerToClientEvents,
	Session,
	User,
} from "../types/types";

const socket: Socket<LobbyServerToClientEvents, LobbyClientToServerEvents> = io(
	"http://localhost:3000",
	{ autoConnect: false },
);
export const MultiplayerLobby = () => {
	const navigate = useNavigate();
	const [session, setSession] = React.useState<Session | null>(null);
	const [isConnected, setIsConnected] = React.useState(false);
	const [users, setUsers] = React.useState<Array<User>>([]);
	const [error, setError] = React.useState<string | null>(null);
	const [name, setName] = React.useState<string>(
		Math.random().toString(36).slice(2, 7),
	);
	const [incomingChallenge, setIncomingChallenge] =
		React.useState<Challenge | null>(null);

	const handleConnect = React.useCallback(
		(sessionID?: string) => {
			setError(null);
			socket.auth = { username: name, ...(sessionID && { sessionID }) };
			socket.connect();
		},
		[name],
	);

	React.useEffect(() => {
		const session = storageService.getItem("session");
		if (session) {
			const parsed = JSON.parse(session);
			console.log("found session!", parsed);
			handleConnect(parsed.sessionID);
		}
	}, [handleConnect]);

	React.useEffect(() => {
		socket.on("session:set", (session) => {
			setSession(session);
			storageService.setItem("session", JSON.stringify(session));
			setIsConnected(true);
		});

		socket.on("users:list", (users) => {
			console.log("initial users", users);
			setUsers(users.filter((user) => user.connected));
		});

		socket.on("user:connected", (user) => {
			console.log("userconnected", user);
			setUsers((prevUsers) => [...prevUsers, user]);
		});

		socket.on("user:disconnected", (id) => {
			console.log("disconnected", id);
			setUsers((prevUsers) =>
				prevUsers.filter((user) => user.userID !== id && user.connected),
			);
		});

		socket.on("connect_error", (err) => {
			setError(err.message);
		});

		socket.on("challenge:got", (challenge) => {
			console.log("you got challenged", challenge);
			setIncomingChallenge(challenge);
		});

		socket.on("game:start", (data) => {
			console.log("game starting", data);
			navigate(`/game/${data.gameId}`);
		});

		return () => {
			socket.off("users:list");
			socket.off("session:set");
			socket.off("user:connected");
			socket.off("user:disconnected");
			socket.off("connect_error");
			socket.off("challenge:got");
			socket.off("game:start");
		};
	}, [navigate]);

	const handleDisconnect = () => {
		setIsConnected(false);
		socket.disconnect();
	};

	const handleChallenge = (id: string) => {
		console.log("challenge sent to ", id);
		socket.emit("challenge:new", id, name);
	};

	const handleChallengeAccept = (id: string) => {
		socket.emit("challenge:accept", id, name);
		setIncomingChallenge(null);
	};

	const handleChallengeDecline = () => {
		setIncomingChallenge(null);
	};

	return (
		<div className="page-container">
			<div>
				{!isConnected ? (
					<>
						{!session && (
							<input value={name} onChange={(e) => setName(e.target.value)} />
						)}
						<button
							type="button"
							onClick={() => handleConnect(session?.sessionID)}
						>
							connect
						</button>
					</>
				) : (
					<>
						<button type="button" onClick={handleDisconnect}>
							disconnect
						</button>
						<h2>Users:</h2>
						{users.map((user) => (
							<div style={{ display: "flex", gap: "4px" }} key={user.userID}>
								<div>{user.username}</div>
								<div>{user.userID}</div>
								{session?.userID === user.userID ? (
									<div>(me)</div>
								) : (
									<button
										type="button"
										onClick={() => handleChallenge(user.userID)}
									>
										challenge
									</button>
								)}
							</div>
						))}
					</>
				)}
				<div>{error && <div>{error}</div>}</div>
			</div>
			<ChallengeModal
				challenge={incomingChallenge}
				onAccept={() =>
					incomingChallenge && handleChallengeAccept(incomingChallenge.from)
				}
				onDecline={handleChallengeDecline}
			/>
		</div>
	);
};
