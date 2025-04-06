import React, { useRef } from "react";
import useScrollToBottom from "../hooks/useScrollToBottom";
import { FaEye } from "react-icons/fa";
import { FiSend } from "react-icons/fi";

const MessageRenderer = ({
  message,
  isSentByUser,
  isFirstOfGroup,
  isLastOfGroup,
  formatMessageDate,
  handleEditMessage,
  isEditing,
  editText,
  setEditText,
  isGroupChat,
  users,
  seenBy,
  isLastMessage,
  canEdit,
  handleUpdateMessage,
}) => {
  return (
    <div
      style={{
        alignSelf: isSentByUser ? "flex-end" : "flex-start",
        display: "flex",
        flexDirection: "column",
        marginBottom: "4px",
        maxWidth: "90%", 
      }}
    >
      {isFirstOfGroup && (
        <div style={{ display: "flex", gap: "4px", marginBottom: "1px", marginLeft: isSentByUser && 'auto' }}>
          {isGroupChat && !isSentByUser && (
            <p style={styles.senderName}>{message.senderName}</p>
          )}
          <p style={styles.messageDate}>
            {formatMessageDate(message.createdAt)}
            {message.isEdited && ", Edited"}
          </p>
        </div>
      )}
      <div
        style={{
          padding: "11px",
          borderRadius: "4px",
          backgroundColor: isSentByUser ? "rgb(37 53 46)" : "rgb(44 51 48)",
          cursor: canEdit ? "pointer" : "default",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.4)",
          maxWidth: "100%", // Ensure the message bubble doesn't exceed its container
        }}
        onClick={() => canEdit && handleEditMessage(message)}
      >
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleUpdateMessage}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUpdateMessage(e);
              }
            }}
            autoFocus
            style={styles.inputBox}
          />
        ) : (
          <p style={styles.text} title={canEdit ? "Edit" : null}>
            {message.text}
          </p>
        )}
      </div>
      {isGroupChat && isLastOfGroup && isSentByUser && seenBy && (
        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            marginTop: "5px",
          }}
        >
          {seenBy.map((uid, idx) => {
            const seenUser = users.find((u) => u.uid === uid);
            return seenUser ? (
              <img
                key={idx}
                src={seenUser.photoURL}
                alt="Seen"
                style={{
                  width: "13px",
                  height: "13px",
                  borderRadius: "50%",
                  marginLeft: "4px",
                }}
              />
            ) : null;
          })}
        </div>
      )}
      {!isGroupChat && isLastMessage && isSentByUser && (
        <div style={{ marginTop: "5px", marginLeft: "auto" }}>
          {message.seen ? (
            <FaEye style={styles.seen} />
          ) : (
            <FiSend style={styles.seen} />
          )}
        </div>
      )}
    </div>
  );
};

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
}) => {
  const chatBoxRef = useRef(null);
  useScrollToBottom(chatBoxRef, messages);

  return (
    <div ref={chatBoxRef} style={styles.chatBox}>
      {messages.map((message, index) => {
        const isSentByUser = message.senderId === logedInUser.uid;
        const isLastMessage = !isGroupChat && index === messages.length - 1;
        const canEdit = isGroupChat
          ? message.seenBy
            ? message.seenBy.length === 0 && isSentByUser
            : true
          : !message.seen;

        return (
          <MessageRenderer
            key={message.id}
            message={message}
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
          />
        );
      })}
      {isTyping && (
        <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "0px" }}>
          {typingText}
        </p>
      )}
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
    maxWidth:'67vw',
  },
  senderName: {
    marginBottom: "1px",
    fontSize: "11px",
    color: "#B0B0B0",
    textTransform: "capitalize",
  },
  messageDate: {
    fontSize: "11px",
    color: "#A0A0A0",
    marginBottom: "1px",
  },
  text: {
    margin: 0,
    color: "#fff",
    wordWrap: "break-word", // Ensure text inside <p> wraps
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
  },
  inputBox: {
    width: "100%",
    fontSize: "14px",
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: "#fff",
  },
  seen: {
    fontSize: "13px",
    color: "#dfdfdf",
  },
};

export default ChatMessages;