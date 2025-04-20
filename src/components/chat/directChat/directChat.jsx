import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import useDeleteUserMessage from "@/hooks/useDeleteUserMessage";
import useEditUserMessage from "@/hooks/useEditUserMessage";
import useFormattedMessageDate from "@/hooks/useFormattedMessageDate";
import useGroupedMessages from "@/hooks/useGroupedMessages";
import useSendFile from "@/hooks/useSendFileToGoogleDrive";
import { useAuthStore } from "@/store/useAuthStore";
import { decryptMessage, encryptMessage } from "@/utils/cryptoUtils";
import { getPrivateKey } from "@/utils/indexedDBUtils";
import ChatMessages from "../message/chatMessage";
import InputBox from "../inputBox/InputBox";
import DirectChatHeader from "./directChatHeader";

const UserChat = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [clearFileInput, setClearFileInput] = useState(false);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const { formatMessageDate } = useFormattedMessageDate();
  const groupedMessages = useGroupedMessages(messages);
  const {
    selectedUserOrGroup,
    setIsUpdateLastConversation,
    logedInUser,
    isUpdateLastConversation,
  } = useAuthStore();

  const {
    editText,
    setEditText,
    editingMessageId,
    handleEditMessage,
    handleUpdateMessage,
  } = useEditUserMessage(selectedUserOrGroup, logedInUser);

  const { handleDeleteMessage, isDeleting } = useDeleteUserMessage("messages");

  const { file, setFile, sendFile, loading } = useSendFile();

  useEffect(() => {
    if (selectedUserOrGroup) {
      const q = query(
        collection(db, "messages"),
        where("senderId", "in", [logedInUser.uid, selectedUserOrGroup.uid]),
        where("recipientId", "in", [logedInUser.uid, selectedUserOrGroup.uid]),
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const decryptedMessages = [];
        const privateKey = await getPrivateKey(logedInUser.uid);
        if (!privateKey) {
          console.error("User's private key not found!");
          return;
        }

        for (const docSnap of querySnapshot.docs) {
          const msg = { id: docSnap.id, ...docSnap.data() };
          try {
            const encryptedText =
              msg.senderId === logedInUser.uid
                ? msg.encryptedTextForSender
                : msg.encryptedTextForRecipient;
            if (!encryptedText) throw new Error("Encrypted text not found!");
            msg.message = decryptMessage(encryptedText, privateKey);
          } catch (error) {
            console.error("Decryption error:", error);
            msg.message = "🔒 Encrypted Message (Decryption Failed)";
          }
          decryptedMessages.push(msg);
        }

        setMessages(decryptedMessages);

        const unseenMessages = decryptedMessages.filter(
          (msg) => msg.recipientId === logedInUser.uid && !msg.seen
        );
        if (unseenMessages.length > 0) {
          const batch = writeBatch(db);
          unseenMessages.forEach((msg) => {
            const msgRef = doc(db, "messages", msg.id);
            batch.update(msgRef, { seen: true });
          });
          await batch.commit();
        }
      });

      return () => unsubscribe();
    }
  }, [logedInUser.uid, selectedUserOrGroup]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (text.trim() === "" && !file) return;

    try {
      const recipientPublicKey = await getUserPublicKey(
        selectedUserOrGroup.uid
      );
      const senderPublicKey = await getUserPublicKey(logedInUser.uid);
      if (!recipientPublicKey || !senderPublicKey) {
        console.error("Public key missing.");
        return;
      }

      if (text) {
        const encryptedTextForRecipient = encryptMessage(
          text,
          recipientPublicKey
        );
        const encryptedTextForSender = encryptMessage(text, senderPublicKey);

        await addDoc(collection(db, "messages"), {
          encryptedTextForRecipient,
          encryptedTextForSender,
          createdAt: serverTimestamp(),
          sender: logedInUser.displayName,
          senderId: logedInUser.uid,
          recipientId: selectedUserOrGroup.uid,
          seen: false,
          isEdited: false,
          isDeleted: false,
          replyTo: replyingTo ? replyingTo.id : null,
          fileLink: null,
          messageType: "text",
        });
      }

      if (file) {
        const fileLink = await sendFile();

        if (fileLink) {
          const encryptedTextForRecipient = encryptMessage(
            fileLink,
            recipientPublicKey
          );

          const encryptedTextForSender = encryptMessage(
            fileLink,
            senderPublicKey
          );
          await addDoc(collection(db, "messages"), {
            encryptedTextForRecipient,
            encryptedTextForSender,
            createdAt: serverTimestamp(),
            sender: logedInUser.displayName,
            senderId: logedInUser.uid,
            recipientId: selectedUserOrGroup.uid,
            seen: false,
            isEdited: false,
            isDeleted: false,
            replyTo: replyingTo ? replyingTo.id : null,
            messageType: "file",
            fileName: file.name,
          });
        }
      }

      //handel last conversation
      const conversationId = [logedInUser.uid, selectedUserOrGroup.uid]
        .sort()
        .join("_");
      await setDoc(
        doc(db, "lastConversations", conversationId),
        {
          lastMessageAt: serverTimestamp(),
          lastMessage: text ? text : "File",
          participants: [logedInUser.uid, selectedUserOrGroup.uid],
        },
        { merge: true }
      );

      //handel message notification
      const encryptedNotification = encryptMessage(
        text ? text : "File",
        recipientPublicKey
      );

      socket.emit("sendMessage", {
        sender: logedInUser.uid,
        receiver: selectedUserOrGroup.uid,
        senderName: logedInUser.displayName,
        message: encryptedNotification,
      });

      setText("");
      setReplyingTo(null);
      setIsUpdateLastConversation(!isUpdateLastConversation);
      setClearFileInput(!clearFileInput);
    } catch (error) {
      console.error("Error encrypting message:", error);
    }
  };

  const getUserPublicKey = async (userId) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? userDoc.data().publicKey : null;
  };

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null); // Cancel the reply
  };

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.on("typing", ({ sender }) => {
      if (sender !== logedInUser.uid) setIsTyping(true);
    });
    socket.on("stopTyping", () => setIsTyping(false));
    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, logedInUser.uid]);

  const handleTyping = () => {
    socket.emit("typing", {
      chatType: "dm",
      sender: logedInUser.uid,
      receiver: selectedUserOrGroup.uid,
    });
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", {
        chatType: "dm",
        receiver: selectedUserOrGroup.uid,
      });
    }, 1500);
  };

  if (!selectedUserOrGroup) return null;

  return (
    <div style={styles.chatContainer}>
     <DirectChatHeader selectedUserOrGroup={selectedUserOrGroup}/>
      <ChatMessages
        messages={groupedMessages}
        isGroupChat={false}
        selectedUserOrGroup={selectedUserOrGroup}
        logedInUser={logedInUser}
        users={[]}
        isTyping={isTyping}
        typingText={`${selectedUserOrGroup.username} is typing...`}
        formatMessageDate={formatMessageDate}
        handleEditMessage={handleEditMessage}
        editingMessageId={editingMessageId}
        editText={editText}
        setEditText={setEditText}
        handleUpdateMessage={handleUpdateMessage}
        handleReply={handleReply}
        handleDeleteMessage={handleDeleteMessage}
        isDeleting={isDeleting}
      />
      <div>
        <InputBox
          sendMessage={sendMessage}
          setText={setText}
          text={text}
          handleTyping={handleTyping}
          replyingTo={replyingTo}
          cancelReply={cancelReply}
          setFile={setFile}
          file={file}
          clearFileInput={clearFileInput}
        />
      </div>
    </div>
  );
};

const styles = {
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    margin: "0 auto",
    backgroundColor: "#1F1F1F",
    color: "#fff",
  }
};

export default UserChat;
