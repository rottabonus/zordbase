import * as React from "react";
import { io, Socket } from "socket.io-client";
import { storageService } from "../services/storageService";

type User = { username?: string; userID: string; connected: boolean };
interface ServerToClientEvents {
  users: (users: Array<User>) => void;
  userconnected: (data: User) => void;
  userdisconnected: (id: string) => void;
  session: (data: Session) => void;
}

type Session = { userID: string; sessionID: string };

interface ClientToServerEvents {
  setusername: (username: string) => void;
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
      handleConnect(parsed.session.sessionID);
    }
  }, []);

  React.useEffect(() => {
    socket.on("session", (session) => {
      setSession(session);
      storageService.setItem("session", JSON.stringify({ session }));
      setIsConnected(true);
    });

    socket.on("users", (users) => {
      console.log("initial users", users);
      setUsers(users.filter((user) => user.connected));
    });

    socket.on("userconnected", (user) => {
      console.log("userconnected", user);
      setUsers((prevUsers) => [...prevUsers, user]);
    });

    socket.on("userdisconnected", (id) => {
      console.log("disconnected", id);
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.userID !== id && user.connected)
      );
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
    });

    return () => {
      socket.off("users");
      socket.off("session");
      socket.off("userconnected");
      socket.off("userdisconnected");
      socket.off("connect_error");
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

  return (
    <div className="page-container">
      <div>
        {!isConnected ? (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button onClick={() => handleConnect(session?.sessionID)}>
              connect
            </button>
          </>
        ) : (
          <>
            <button onClick={handleDisconnect}>disconnect</button>
            <h2>Users:</h2>
            {users.map((user) => (
              <div style={{ display: "flex", gap: "2px" }} key={user.userID}>
                <div>{user.username}</div>
                {session.userID === user.userID ? (
                  <div>(me)</div>
                ) : (
                  <button onClick={() => console.log("challenge user")}>
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
