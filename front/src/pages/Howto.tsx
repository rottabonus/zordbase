import React from "react";

export const Howto: React.FC = () => {
  return (
    <div className="howto-page-container">
      <div className="howto-header">
        <h2>How to play</h2>
      </div>
      <div className="howto-paragraph">
        <p>The goal is to reach the opponents base by playing words.</p>
        <p>Words are created by selecting letters one by one.</p>
        <p>
          Letter selection must start from your own base, and only the
          neighboring node can be selected. However you can move in any
          direction.
        </p>
        <p>
          Bases are highlighted by colors.{" "}
          <span style={{ color: "#87b6b8" }}>Player</span> starts from top and{" "}
          <span style={{ color: "khaki" }}>computer</span> from bottom
        </p>
        <p>
          {" "}
          When you are happy with your selection, you may confirm the selection
          from the confirm-button <i className="fa fa-chevron-circle-down"></i>,
          on the bottom of the board.
        </p>
        <p>
          Every time a word is played, your base is expanded. All nodes that are
          not connected to your base, are cut off. This way you may block your
          opponents advances.{" "}
        </p>
        <p>
          The words must be in the basic form and at the moment only Finnish
          wordlist is found in the game.
        </p>
        <p>Have fun!</p>
      </div>
    </div>
  );
};
