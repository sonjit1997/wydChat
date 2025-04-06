import { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children, socket }) => {
  const [notifications, setNotifications] = useState(null); // Store only one notification

  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (data) => {
      setNotifications(data); // Replace with the latest notification
    });

    return () => {
      socket.off("notification"); // Clean up to prevent duplicate listeners
    };
  }, [socket]);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
