import * as React from "react";
import { useNavigate } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import { storageService } from "../services/storageService";

type User = { username?: string; userID: string; connected: boolean };
type Challenge = { from: string; to: string };

const ChallengeModal = ({
	challenge,
	onAccept,
	onDecline,
}: {
	challenge: Challenge | null;
	onAccept: () => void;
	onDecline: () => void;
}) => {
	if (!challenge) return null;

	return (
		<div
			className="modal-overlay"
			onClick={onDecline}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: "rgba(0, 0, 0, 0.5)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 1000,
			}}
		>
			<div
				className="modal-content"
				onClick={(e) => e.stopPropagation()}
				style={{
					backgroundColor: "white",
					padding: "24px",
					borderRadius: "8px",
					boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
					minWidth: "300px",
					textAlign: "center",
				}}
			>
				<h3 style={{ margin: "0 0 16px 0" }}>New Challenge</h3>
				<p style={{ margin: "0 0 24px 0" }}>
					<strong>{challenge.from}</strong> has challenged you to a game!
				</p>
				<div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
					<button
						onClick={onDecline}
						style={{
							padding: "8px 24px",
							backgroundColor: "#f44336",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						Decline
					</button>
					<button
						onClick={onAccept}
						style={{
							padding: "8px 24px",
							backgroundColor: "#4caf50",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						Accept
					</button>
				</div>
			</div>
		</div>
	);
};

interface GameStartData {
	gameId: string;
	players: [string, string];
	player1: string;
	player2: string;
	board: string[][];
}

interface ServerToClientEvents {
	"users:list": (users: Array<User>) => void;
	"user:connected": (data: User) => void;
	"user:disconnected": (id: string) => void;
	"session:set": (data: Session) => void;

	"challenge:got": (challenge: Challenge) => void;
	"game:start": (data: GameStartData) => void;
}

type Session = { userID: string; sessionID: string };

interface ClientToServerEvents {
	"challenge:new": (challenged: string) => void;
	"challenge:accept": (challenger: string) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
	"http://localhost:3000",
	{ autoConnect: false },
);
export const Multiplayer = () => {
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

	React.useEffect(() => {
		const session = storageService.getItem("session");
		if (session) {
			const parsed = JSON.parse(session);
			console.log("found session!", parsed);
			handleConnect(parsed.sessionID);
		}
	}, []);

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

	const handleConnect = (sessionID?: string) => {
		setError(null);
		socket.auth = { username: name, ...(sessionID && { sessionID }) };
		socket.connect();
	};

	const handleDisconnect = () => {
		setIsConnected(false);
		socket.disconnect();
	};

	const handleChallenge = (id: string) => {
		console.log("challenge sent to ", id);
		socket.emit("challenge:new", id);
	};

	const handleChallengeAccept = (id: string) => {
		socket.emit("challenge:accept", id);
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
						<button onClick={() => handleConnect(session?.sessionID)}>
							connect
						</button>
					</>
				) : (
					<>
						<button onClick={handleDisconnect}>disconnect</button>
						<h2>Users:</h2>
						{users.map((user) => (
							<div style={{ display: "flex", gap: "4px" }} key={user.userID}>
								<div>{user.username}</div>
								<div>{user.userID}</div>
								{session?.userID === user.userID ? (
									<div>(me)</div>
								) : (
									<button onClick={() => handleChallenge(user.userID)}>
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
