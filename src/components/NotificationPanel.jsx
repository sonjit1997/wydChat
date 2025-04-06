import React, { useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { getPrivateKey } from "../utils/indexedDBUtils";
import { decryptMessage } from "../utils/cryptoUtils";

const NotificationPanel = ({ user }) => {
  const { notifications } = useNotifications();

  useEffect(() => {
    const processNotification = async () => {
      if (!notifications) return;

      const { senderName, message, type, groupName } = notifications;
      const privateKey = await getPrivateKey(user.uid);
      const text = decryptMessage(message, privateKey);

      // Check if notification permission is granted
      if (Notification.permission === "granted") {
        const notification = new Notification(senderName, {
          body: text,
          icon: "/notification-icon.png",
        });

        // notification.onclick = (event) => {
        //   event.preventDefault();
        //   window.open(`/bookings`, "_blank");
        // };
      }


      // Request permission if not denied
      else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const notification = new Notification(senderName, {
            body: text,
            icon: "/notification-icon.png",
          });

          // notification.onclick = (event) => {
          //   event.preventDefault();
          //   window.open(`/bookings`, "_blank");
          // };
        }
      }
    };

    processNotification();
  }, [notifications]);

  return null;
};

export default NotificationPanel;
