import * as React from "react";
import { io, Socket } from "socket.io-client";

type User = { username?: string; userID: string };
interface ServerToClientEvents {
  users: (users: Array<User>) => void;
  userconnected: (data: User) => void;
  userdisconnected: (id: string) => void;
}

interface ClientToServerEvents {
  setusername: (username: string) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:3000",
  { autoConnect: false }
);
export const Multiplayer = () => {
  const [users, setUsers] = React.useState<Array<User>>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState<string>(
    Math.random().toString(36).slice(2, 7)
  );

  React.useEffect(() => {
    socket.on("users", (users) => {
      console.log("initial users", users);
      setUsers(users);
    });

    socket.on("userconnected", (user) => {
      console.log("userconnected", user);
      setUsers((prevUsers) => [...prevUsers, user]);
    });

    socket.on("userdisconnected", (id) => {
      console.log("disconnected", id);
      setUsers((prevUsers) => prevUsers.filter((user) => user.userID !== id));
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
    });

    return () => {
      socket.off("users");
      socket.off("userconnected");
      socket.off("userdisconnected");
      socket.off("connect_error");
    };
  }, []);

  const handleConnect = () => {
    setError(null);
    socket.auth = { username: name };
    socket.connect();
  };

  return (
    <div className="page-container">
      <div>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={handleConnect}>connect</button>
        <div>
          <h2>Users:</h2>
          {users.map((user) => (
            <div key={user.userID}>{user.username}</div>
          ))}
        </div>
        {error && <div>{error}</div>}
      </div>
    </div>
  );
};
