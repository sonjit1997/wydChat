import { useEffect, useState } from "react";

const useTyping = ({ socket, logedInUser, selectedUserOrGroup, chatType }) => {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!socket || !logedInUser?.uid || !selectedUserOrGroup) return;

    socket.on("typing", ({ sender, groupId }) => {
      if (chatType === "dm") {
        if (sender !== logedInUser.uid) {
          setIsTyping(true);
        }
      } else if (chatType === "group") {
        if (selectedUserOrGroup.groupId === groupId) {
          setIsTyping(true);
        }
      }
    });

    // Handle stopTyping event
    socket.on("stopTyping", () => {
      setIsTyping(false);
    });

    // Cleanup socket listeners
    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, logedInUser?.uid, selectedUserOrGroup, chatType]);

  const handleTyping = () => {
    if (!socket || !selectedUserOrGroup) return;

    const typingData =
      chatType === "dm"
        ? {
            chatType: "dm",
            sender: logedInUser.uid,
            receiver: selectedUserOrGroup.uid,
          }
        : {
            chatType: "group",
            sender: logedInUser.uid,
            groupId: selectedUserOrGroup.groupId,
            members: selectedUserOrGroup.memberIds,
          };

    // Emit typing event
    socket.emit("typing", typingData);

    // Clear previous timeout
    const timeoutKey =
      chatType === "dm" ? "typingTimeout" : "groupTypingTimeout";
    clearTimeout(window[timeoutKey]);

    // Set new timeout to stop typing
    window[timeoutKey] = setTimeout(() => {
      socket.emit("stopTyping", typingData);
    }, 1500);
  };

  return { isTyping, handleTyping };
};

export default useTyping;
