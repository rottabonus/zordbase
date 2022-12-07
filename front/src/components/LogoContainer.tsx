import React from "react";
import logo from "../media/doggiedoo.png";

export const LogoContainer: React.FC = () => {
  return (
    <div className="dog-container">
      <span>
        <img className="dog-image" src={logo} />
      </span>
    </div>
  );
};

