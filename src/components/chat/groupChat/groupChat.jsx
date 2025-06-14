import { db } from "@/firebase";
import useDeleteUserMessage from "@/hooks/useDeleteUserMessage";
import useEditGroupMessage from "@/hooks/useEditeGroupMessage";
import useFormattedMessageDate from "@/hooks/useFormattedMessageDate";
import useGroupedMessages from "@/hooks/useGroupedMessages";
import useGroupKey from "@/hooks/useGroupKey";
import useTyping from "@/hooks/useIsTyping";
import useSendFile from "@/hooks/useSendFileToGoogleDrive";
import { useAuthStore } from "@/store/useAuthStore";
import { decryptGroupMessage, encryptGroupMessage } from "@/utils/cryptoUtils";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import InputBox from "../inputBox/InputBox";
import ChatMessages from "../message/messageDetails";
import GroupChatHeader from "./groupChatHeader";

const GroupChat = ({ socket }) => {
  const {
    setIsUpdateLastConversation,
    logedInUser,
    isUpdateLastConversation,
    selectedUserOrGroup,
    setSelectedUserOrGroup,
  } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [clearFileInput, setClearFileInput] = useState(false);
  const [isLoading, setisloading] = useState(false);
  const [text, setText] = useState("");
  const { formatMessageDate } = useFormattedMessageDate();
  const groupedMessages = useGroupedMessages(groupMessages);
  const groupKey = useGroupKey(selectedUserOrGroup, logedInUser);
  const {
    editText,
    setEditText,
    editingMessageId,
    handleEditMessage,
    handleUpdateMessage,
  } = useEditGroupMessage(groupKey);

  const { handleDeleteMessage, isDeleting } =
    useDeleteUserMessage("groupMessages");

  const { file, setFile, fileType, sendFile, loading } = useSendFile();

  const { isTyping, handleTyping } = useTyping({
    socket,
    logedInUser,
    selectedUserOrGroup,
    chatType: "group",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (
        selectedUserOrGroup?.memberIds &&
        selectedUserOrGroup.memberIds.length > 0
      ) {
        const usersQuery = query(
          collection(db, "users"),
          where("uid", "in", selectedUserOrGroup.memberIds)
        );
        const querySnapshot = await getDocs(usersQuery);
        const usersData = querySnapshot.docs.map((doc) => doc.data());
        setUsers(usersData);
      }
    };
    fetchUsers();
  }, [selectedUserOrGroup]);

  useEffect(() => {
    if (!selectedUserOrGroup?.groupId || !logedInUser?.uid || !groupKey) return;

    const messagesQuery = query(
      collection(db, "groupMessages"),
      where("groupId", "==", selectedUserOrGroup.groupId),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(messagesQuery, async (querySnapshot) => {
      const fetchedMessages = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const messageData = docSnapshot.data();
          const decryptedText = decryptGroupMessage(messageData.text, groupKey);

          if (
            messageData.senderId !== logedInUser.uid &&
            !messageData.seenBy?.includes(logedInUser.uid)
          ) {
            try {
              await updateDoc(doc(db, "groupMessages", docSnapshot.id), {
                seenBy: [...(messageData.seenBy || []), logedInUser.uid],
              });
            } catch (error) {
              console.error("Error updating seenBy:", error);
            }
          }

          return {
            id: docSnapshot.id,
            ...messageData,
            message: decryptedText,
          };
        })
      );
      setGroupMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [selectedUserOrGroup, logedInUser, groupKey]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setisloading(true);
    if (text.trim() === "" && !file) return;

    if (!groupKey) return;

    try {
      if (text) {
        const encryptedMessage = encryptGroupMessage(text, groupKey);
        await addDoc(collection(db, "groupMessages"), {
          text: encryptedMessage,
          senderId: logedInUser.uid,
          senderName: logedInUser.displayName,
          groupId: selectedUserOrGroup.groupId,
          createdAt: new Date(),
          seenBy: [],
          isEdited: false,
          isDeleted: false,
          replyTo: replyingTo ? replyingTo.id : null,
          messageType: "text",
        });
      }

      if (file) {
        const fileLink = await sendFile();
        if (fileLink) {
          const encryptedText = encryptGroupMessage(fileLink, groupKey);
          await addDoc(collection(db, "groupMessages"), {
            text: encryptedText,
            senderId: logedInUser.uid,
            senderName: logedInUser.displayName,
            groupId: selectedUserOrGroup.groupId,
            createdAt: new Date(),
            seenBy: [],
            isEdited: false,
            isDeleted: false,
            replyTo: replyingTo ? replyingTo.id : null,
            messageType: fileType,
            fileName: file.name,
          });
        }
      }

      await setDoc(
        doc(db, "lastConversations", selectedUserOrGroup.groupId),
        {
          lastMessageAt: serverTimestamp(),
          lastMessage: text ? text : "File",
          participants: [...selectedUserOrGroup.memberIds],
        },
        { merge: true }
      );

      //handel message notification
      const encryptedNotification = encryptGroupMessage(
        text ? text : "File",
        groupKey
      );

      const senderName = logedInUser.displayName.split(" ")[0];
      const members = selectedUserOrGroup.memberIds;

      socket.emit("sendGroupMessage", {
        sender: logedInUser.uid,
        senderName,
        groupName: selectedUserOrGroup.groupName,
        members,
        message: encryptedNotification,
      });

      setisloading(false);
      setText("");
      setReplyingTo(null);
      setIsUpdateLastConversation(!isUpdateLastConversation);
      setClearFileInput(!clearFileInput);
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const [replyingTo, setReplyingTo] = useState(null);

  const handleReply = (message) => {
    setReplyingTo(message); // Set the message to reply to
  };

  const cancelReply = () => {
    setReplyingTo(null); // Cancel the reply
  };

  if (!selectedUserOrGroup) return null;

  return (
    <div style={styles.chatContainer}>
      <GroupChatHeader
        selectedGroup={selectedUserOrGroup}
        setSelectedGroup={setSelectedUserOrGroup}
        logedInUser={logedInUser}
        groupMembers={users}
      />
      <ChatMessages
        messages={groupedMessages}
        isGroupChat={true}
        selectedUserOrGroup={selectedUserOrGroup}
        logedInUser={logedInUser}
        users={users}
        isTyping={isTyping}
        typingText="Someone is typing..."
        formatMessageDate={formatMessageDate}
        handleEditMessage={handleEditMessage}
        editingMessageId={editingMessageId}
        editText={editText}
        setEditText={setEditText}
        handleUpdateMessage={handleUpdateMessage}
        handleDeleteMessage={handleDeleteMessage}
        isDeleting={isDeleting}
        handleReply={handleReply}
      />
      <InputBox
        sendMessage={handleSendMessage}
        setText={setText}
        text={text}
        handleTyping={handleTyping}
        replyingTo={replyingTo}
        cancelReply={cancelReply}
        setFile={setFile}
        file={file}
        clearFileInput={clearFileInput}
        isLoading={isLoading}
      />
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
  },
};

export default GroupChat;
