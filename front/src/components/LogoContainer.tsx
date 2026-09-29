import type React from "react";
import logo from "../media/doggiedoo.png";

export const LogoContainer: React.FC = () => {
	return (
		<div className="dog-container">
			<span>
				<img className="dog-image" src={logo} alt="Game logo" />
			</span>
		</div>
	);
};
