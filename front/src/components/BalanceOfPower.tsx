import type React from "react";

interface BalanceOfPowerProps {
	playerPercentage: number;
	playerName: string;
	opponentName?: string;
}

export const BalanceOfPower: React.FC<BalanceOfPowerProps> = (props) => {
	const fillerStyles = {
		height: "100%",
		width: `${props.playerPercentage}%`,
		backgroundColor: "#87b6b8",
		borderRadius: "inherit",
	};

	const opponentName = props.opponentName || "computer";

	return (
		<div className="balanceBar">
			<div style={fillerStyles}>
				<span className="playerLabel">{props.playerName}</span>
				<span className="comLabel">{opponentName}</span>
			</div>
		</div>
	);
};
