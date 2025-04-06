import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "../firebase";
import { encryptMessage } from "../utils/cryptoUtils";

const useEditeUserMessage = (selectedUser, user) => {
  const [editText, setEditText] = useState("");
  const [beforeEditText, setBeforeEditText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);

  const handleEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditText(message.text);
    setBeforeEditText(message.text);
  };

  const handleUpdateMessage = async (e) => {
    e.preventDefault();
    if (editText.trim() === "") return;

    if (editText === beforeEditText) {
      setEditText("");
      setEditingMessageId(null);
      return;
    }

    const recipientPublicKey = await getUserPublicKey(selectedUser.uid);
    const senderPublicKey = await getUserPublicKey(user.uid);

    if (!recipientPublicKey || !senderPublicKey) {
      console.error("Public key missing.");
      return;
    }

    const encryptedTextForRecipient = encryptMessage(
      editText,
      recipientPublicKey
    );
    const encryptedTextForSender = encryptMessage(editText, senderPublicKey);

    const msgRef = doc(db, "messages", editingMessageId);

    try {
      await updateDoc(msgRef, {
        encryptedTextForRecipient,
        encryptedTextForSender,
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

export default useEditeUserMessage;
