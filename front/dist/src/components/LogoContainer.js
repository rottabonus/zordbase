import React from "react";
import logo from "../media/doggiedoo.png";
export const LogoContainer = () => {
    return (React.createElement("div", { className: "dog-container" },
        React.createElement("span", null,
            React.createElement("img", { className: "dog-image", src: logo }))));
};
