import { useEffect } from "react";
import { io } from "socket.io-client";

let socketInstance; // Global instance to maintain the same socket connection

export function useSocket() {
  const url = import.meta.env.PUBLIC_GRAPHQL_URL;
  const options = { autoConnect: false };
  if (!socketInstance) {
    socketInstance = io(url, options);
  }

  useEffect(() => {
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socketInstance;
}
