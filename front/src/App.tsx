import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./css/index.css";

import { GameBoardPage } from "./pages/BoardPage";
import { Howto } from "./pages/Howto";
import { About } from "./pages/About";

export const App: React.FC = () => {
  return (
    <Router>
      <div className="topnav">
        <Link to={"/"}>
          <span>Play</span>
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
          <Route path="/*" element={<GameBoardPage />} />
          <Route path="/howto" element={<Howto />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
