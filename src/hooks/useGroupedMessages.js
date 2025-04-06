import { useCallback, useMemo } from "react";

const useGroupedMessages = (messages) => {
  const groupMessagesByTimestamp = useCallback((messages) => {
    let groupedMessages = [];
    let lastTimestamp = null;

    messages.forEach((message, index) => {
      // Convert timestamp to a comparable value (ignoring seconds and milliseconds)
      const messageTime = new Date(message.createdAt * 10).setMilliseconds(0);
      const isSameTimeAsPrevious = lastTimestamp === messageTime;

      // Check if the next message belongs to the same group
      const nextMessage = messages[index + 1];
      const nextMessageTime = nextMessage
        ? new Date(nextMessage.createdAt * 10).setMilliseconds(0)
        : null;

      const isLastOfGroup = nextMessageTime !== messageTime;

      if (!isSameTimeAsPrevious) {
        groupedMessages.push({
          ...message,
          isFirstOfGroup: true,
          isLastOfGroup,
        });
        lastTimestamp = messageTime;
      } else {
        groupedMessages.push({
          ...message,
          isFirstOfGroup: false,
          isLastOfGroup,
        });
      }
    });

    return groupedMessages;
  }, []);

  return useMemo(() => groupMessagesByTimestamp(messages), [messages, groupMessagesByTimestamp]);
};

export default useGroupedMessages;
