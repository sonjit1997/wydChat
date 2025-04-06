import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";

let socketInstance; // Global instance to maintain the same socket connection

export function useSocket(url = "http://localhost:4000", options = { autoConnect: false }) {
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
