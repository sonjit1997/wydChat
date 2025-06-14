import { useRef } from "react";
import useScrollToBottom from "@/hooks/useScrollToBottom";
import MessageRenderer from './singelMessage'
const ChatMessages = ({
  messages,
  isGroupChat,
  selectedUserOrGroup,
  logedInUser,
  users,
  isTyping,
  typingText,
  formatMessageDate,
  handleEditMessage,
  editingMessageId,
  editText,
  setEditText,
  handleUpdateMessage,
  handleReply,
  handleDeleteMessage,
  isDeleting,
}) => {
  const chatBoxRef = useRef(null);
  useScrollToBottom(chatBoxRef, messages);

  return (
    <div ref={chatBoxRef} style={styles.chatBox}>
      {messages.map((message, index) => {
        const isSentByUser = message.senderId === logedInUser.uid;
        const isLastMessage = !isGroupChat && index === messages.length - 1;
        const canEdit = isGroupChat
          ? message.messageType === "text" &&
            (message.seenBy
              ? message.seenBy.length === 0 && isSentByUser
              : true)
          : message.messageType === "text" && !message.seen;

        return (
          <MessageRenderer
            key={message.id}
            messageObject={message}
            isSentByUser={isSentByUser}
            isFirstOfGroup={message.isFirstOfGroup}
            isLastOfGroup={message.isLastOfGroup}
            formatMessageDate={formatMessageDate}
            handleEditMessage={handleEditMessage}
            isEditing={editingMessageId === message.id}
            editText={editText}
            setEditText={setEditText}
            isGroupChat={isGroupChat}
            users={users}
            seenBy={message.seenBy}
            isLastMessage={isLastMessage}
            canEdit={canEdit}
            handleUpdateMessage={handleUpdateMessage}
            handleReply={handleReply}
            messages={messages}
            handleDeleteMessage={handleDeleteMessage}
            isDeleting={isDeleting}
          />
        );
      })}

      <p
        style={{
          fontSize: "13px",
          color: "#aaa",
          marginBottom: "0px",
          visibility: isTyping ? "visible" : "hidden",
        }}
      >
        {isTyping && typingText}
      </p>
    </div>
  );
};

const styles = {
  chatBox: {
    flex: 1,
    padding: "11px 56px 11px 63px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "0px",
    maxWidth: "67vw",
  },
};

export default ChatMessages;
