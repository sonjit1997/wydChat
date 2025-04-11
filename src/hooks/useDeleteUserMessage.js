import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "../firebase";

const useDeleteUserMessage = (collection) => {
  const [isDeleting, setIsDeleting] = useState(false);

 
  const handleDeleteMessage = async (message, status) => {
    if (!message.id) return;
    const messageId = message.id;

    const msgRef = doc(db, collection, messageId);

    try {
      await updateDoc(msgRef, {
        isDeleted: status,
      });
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDeleteMessage,
  };
};

export default useDeleteUserMessage;
