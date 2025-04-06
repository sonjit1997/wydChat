import { useCallback } from "react";

const useFormattedMessageDate = () => {
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
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    // Check if the message is from today
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return `${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // Ensure 12-hour format
        timeZone: "Asia/Kolkata",
      })}`;
    }

    // Check if the message is within the last 7 days
    if (date > oneWeekAgo) {
      return `${date.toLocaleString("en-US", {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      })}`;
    }

    // Show full date with 12-hour format
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  }, []);

  return { formatMessageDate };
};

export default useFormattedMessageDate;
