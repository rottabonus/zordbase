import type * as React from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./css/index.css";

import { SocketProvider } from "./contexts/SocketContext";
import { About } from "./pages/About";
import { GameBoardPage } from "./pages/BoardPage";
import { Howto } from "./pages/Howto";
import { MultiplayerGameBoardPage } from "./pages/MultiplayerGameBoardPage";
import { MultiplayerLobby } from "./pages/MultiplayerLobby";

export const App: React.FC = () => {
	return (
		<SocketProvider>
			<Router>
				<div className="topnav">
					<Link to={"/"}>
						<span>Play</span>
					</Link>
					<Link to={"/multiplayer"}>
						<span>Multiplayer</span>
					</Link>
					<Link to={"/howto"}>
						<span>How to</span>
					</Link>
					<Link to={"/about"}>
						<span>About</span>
					</Link>
				</div>
				<div>
					<Routes>
						<Route path="/" element={<GameBoardPage />} />
						<Route path="/howto" element={<Howto />} />
						<Route path="/about" element={<About />} />
						<Route path="/multiplayer" element={<MultiplayerLobby />} />
						<Route
							path="/game/:gameId"
							element={<MultiplayerGameBoardPage />}
						/>
					</Routes>
				</div>
			</Router>
		</SocketProvider>
	);
};

export default App;
