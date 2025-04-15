import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "../firebase";
import { encryptGroupMessage } from "../utils/cryptoUtils";

const useEditeGroupMessage = (groupKey) => {
  const [editText, setEditText] = useState("");
  const [beforeEditText, setBeforeEditText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);

  const handleEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditText(message.message);
    setBeforeEditText(message.message);
  };

  const handleUpdateMessage = async (e) => {
    e.preventDefault();
    if (editText.trim() === "") return;

    if (editText === beforeEditText) {
      setEditText("");
      setEditingMessageId(null);
      return;
    }

    const encryptedText = encryptGroupMessage(editText, groupKey);

    const msgRef = doc(db, "groupMessages", editingMessageId);

    try {
      await updateDoc(msgRef, {
        text: encryptedText,
        isEdited: true,
      });
      setEditText("");
      setEditingMessageId(null);
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const getUserPublicKey = async (userId) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? userDoc.data().publicKey : null;
  };

  return {
    editText,
    setEditText,
    editingMessageId,
    handleEditMessage,
    handleUpdateMessage,
  };
};

export default useEditeGroupMessage;
