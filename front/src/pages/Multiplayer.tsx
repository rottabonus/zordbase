import * as React from "react";
import { io, Socket } from "socket.io-client";
import { storageService } from "../services/storageService";

type User = { username?: string; userID: string; connected: boolean };
type Challenge = { from: string; to: string };
interface ServerToClientEvents {
  ["users:list"]: (users: Array<User>) => void;
  ["user:connected"]: (data: User) => void;
  ["user:disconnected"]: (id: string) => void;
  ["session:set"]: (data: Session) => void;

  ["challenge:got"]: (challenge: Challenge) => void;
  ["game:start"]: (challenge: Challenge) => void;
}

type Session = { userID: string; sessionID: string };

interface ClientToServerEvents {
  ["challenge:new"]: (challenged: string) => void;
  ["challenge:accept"]: (challenger: string) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:3000",
  { autoConnect: false }
);
export const Multiplayer = () => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [users, setUsers] = React.useState<Array<User>>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState<string>(
    Math.random().toString(36).slice(2, 7)
  );

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
        prevUsers.filter((user) => user.userID !== id && user.connected)
      );
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
    });

    socket.on("challenge:got", (challenge) => {
      console.log("you got challenged", challenge);
      const result = window.confirm(
        `you got challenged from  ${challenge.from}`
      );
      if (result) {
        console.log("challenge accepted");
        handleChallengeAccept(challenge.from);
      }
    });

    socket.on("game:start", (challenge) => {
      console.log(
        "challenge was accepted, game should start with players",
        challenge.from,
        "and",
        challenge.to
      );
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
  }, []);

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
                {session.userID === user.userID ? (
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
    </div>
  );
};
