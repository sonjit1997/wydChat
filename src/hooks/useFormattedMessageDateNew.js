import { useCallback } from "react";

const useFormattedMessageDateNew = () => {
  const formatMessageDate = useCallback((createdAt) => {
    if (!createdAt || typeof createdAt !== "object" || !createdAt.seconds) {
      console.error("Invalid timestamp:", createdAt);
      return "Invalid date";
    }

    const date = new Date(createdAt.seconds * 1000); // Convert Firebase timestamp to Date object

    if (isNaN(date.getTime())) {
      console.error("Failed to parse timestamp:", createdAt);
      return "Invalid date";
    }

    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    }

    // If the date is in the current year, format as MM/DD
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
      });
    }

    // Otherwise, format as MM/DD/YYYY
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  return { formatMessageDate };
};

export default useFormattedMessageDateNew;
