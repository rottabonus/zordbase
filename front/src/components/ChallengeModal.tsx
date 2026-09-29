import type { Challenge } from "../types/types";

export const ChallengeModal = ({
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
