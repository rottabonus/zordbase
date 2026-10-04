import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ChallengeModal } from "../components/ChallengeModal";
import { useMultiplayerLobby } from "../hooks/useMultiplayer";
import type { GameStartData } from "../types/types";

export const MultiplayerLobby = () => {
	const navigate = useNavigate();
	const isNavigatingToGame = React.useRef(false);

	const {
		users,
		session,
		error,
		name,
		setName,
		incomingChallenge,
		connect,
		disconnect,
		challenge,
		acceptChallenge,
		declineChallenge,
		isConnected,
	} = useMultiplayerLobby({
		onSessionRestore: (restoredSession) => {
			// Session is already set in the hook
			console.log("Session restored in lobby:", restoredSession);
		},
		onConnectError: (err) => {
			console.error("Connection error:", err);
		},
		onGameStart: (data: GameStartData) => {
			isNavigatingToGame.current = true;
			navigate(`/game/${data.gameId}`);
		},
	});

	return (
		<div className="page-container">
			<div>
				{!isConnected ? (
					<>
						{!session && (
							<input value={name} onChange={(e) => setName(e.target.value)} />
						)}
						<button type="button" onClick={() => connect(name)}>
							connect
						</button>
					</>
				) : (
					<>
						<button type="button" onClick={disconnect}>
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
									<button type="button" onClick={() => challenge(user.userID)}>
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
					incomingChallenge && acceptChallenge(incomingChallenge.from)
				}
				onDecline={declineChallenge}
			/>
		</div>
	);
};
