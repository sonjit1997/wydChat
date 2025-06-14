import { useNotifications } from "@/context/NotificationContext";
import useGroupKey from "@/hooks/useGroupKey";
import { useAuthStore } from "@/store/useAuthStore";
import { decryptGroupMessage, decryptMessage } from "@/utils/cryptoUtils";
import { getPrivateKey } from "@/utils/indexedDBUtils";
import { useEffect } from "react";

const NotificationPanel = () => {
  const { notifications } = useNotifications();
  const { selectedUserOrGroup, logedInUser } = useAuthStore();
  const groupKey = useGroupKey(selectedUserOrGroup, logedInUser);

  useEffect(() => {
    if (!notifications || !logedInUser) return; // ✅ Early return to prevent unnecessary execution

    const processNotification = async () => {
      try {
        const { senderName, message, type, groupName } = notifications;
        const privateKey = await getPrivateKey(logedInUser.uid);

        const decryptedMessage =
          type === "group"
            ? decryptGroupMessage(message, groupKey)
            : decryptMessage(message, privateKey);

        const sendBy = type === "group" ? groupName : senderName;

        // ✅ Show notification if permission is granted
        if (Notification.permission === "granted") {
          showNotification(sendBy, decryptedMessage);
        }
        // ✅ Request permission only if not denied
        else if (Notification.permission !== "denied") {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            showNotification(sendBy, decryptedMessage);
          }
        }
      } catch (error) {
        console.error("Error processing notification:", error);
      }
    };

    processNotification();
  }, [notifications, logedInUser, groupKey]);

  const showNotification = (title, message) => {
    new Notification(title, {
      body: message,
      icon: "/notification-icon.png",
    });
  };

  return null;
};

export default NotificationPanel;
