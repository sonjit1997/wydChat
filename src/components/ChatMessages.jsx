import React, { useRef, useState } from "react";
import useScrollToBottom from "../hooks/useScrollToBottom";
import { FaEye, FaReply } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
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
  handleReply,
  messages,
  handleDeleteMessage,
  isDeleting,
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const { text, replyTo, isDeleted, createdAt, isEdited, senderName, seen } =
    message;
  const repliedToMessage = replyTo
    ? messages.find((msg) => msg.id === replyTo)
    : null;

  // Early return if message is deleted
  if (isDeleted || isDeleting) {
    return (
      <div
        style={{
          alignSelf: isSentByUser ? "flex-end" : "flex-start",
          display: "flex",
          flexDirection: "column",
          marginBottom: "4px",
          maxWidth: "90%",
          position: "relative",
          padding: "11px",
          borderRadius: "4px",
          backgroundColor: isSentByUser ? "rgb(37 53 46)" : "rgb(44 51 48)",
        }}
      >
        <p style={styles.text}>
          This message has been deleted.{" "}
          {isSentByUser && (
            <button
              style={{
                cursor: "pointer",
              }}
              onClick={() => handleDeleteMessage(message, false)}
            >
              Undo
            </button>
          )}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        alignSelf: isSentByUser ? "flex-end" : "flex-start",
        display: "flex",
        flexDirection: "column",
        marginBottom: "4px",
        maxWidth: "90%",
        position: "relative",
        cursor: "pointer",
      }}
      onMouseEnter={() => setShowContextMenu(true)}
      onMouseLeave={() => setShowContextMenu(false)}
    >
      {isFirstOfGroup && (
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "1px",
            marginLeft: isSentByUser ? "auto" : "0",
          }}
        >
          {isGroupChat && !isSentByUser && (
            <p style={styles.senderName}>{senderName}</p>
          )}

          <p style={styles.messageDate}>
            {createdAt && formatMessageDate(createdAt)}
            {isEdited && ", Edited"}
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
          maxWidth: "100%",
        }}
      >
        {repliedToMessage && (
          <div style={styles.replySnippet}>
            <p style={styles.replySnippetText}>
              {repliedToMessage.text.slice(0, 50)}
              {repliedToMessage.text.length > 50 ? "..." : ""}
            </p>
          </div>
        )}

        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleUpdateMessage}
            onKeyDown={(e) => e.key === "Enter" && handleUpdateMessage(e)}
            autoFocus
            style={styles.inputBox}
          />
        ) : (
          <p style={styles.text}>{text}</p>
        )}
      </div>

      {showContextMenu && (
        <div style={styles.contextMenu}>
          <button
            title="Reply"
            onClick={() => handleReply(message)}
            style={styles.contextButton}
          >
            <FaReply />
          </button>
          {canEdit && (
            <button
              title="Edit"
              onClick={() => handleEditMessage(message)}
              style={styles.contextButton}
            >
              <MdEdit />
            </button>
          )}
          {isSentByUser && (
            <button
              title="Delete"
              onClick={() => handleDeleteMessage(message, true)}
              style={styles.contextButton}
            >
              <MdDelete />
            </button>
          )}
        </div>
      )}

      {isGroupChat && isLastOfGroup && isSentByUser && seenBy?.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            marginTop: "5px",
          }}
        >
          {seenBy
            .map((uid) => users.find((u) => u.uid === uid))
            .filter(Boolean) // Remove null values
            .map((seenUser, idx) => (
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
            ))}
        </div>
      )}

      {!isGroupChat && isLastMessage && isSentByUser && !isEditing && (
        <div style={{ marginTop: "5px", marginLeft: "auto" }}>
          {seen ? (
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
            handleReply={handleReply}
            messages={messages}
            handleDeleteMessage={handleDeleteMessage}
            isDeleting={isDeleting}
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
    maxWidth: "67vw",
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
    wordWrap: "break-word",
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
  replySnippet: {
    backgroundColor: "#1F1F1F",
    padding: "7px",
    borderRadius: "4px",
    marginBottom: "4px",
    border: "1px solid rgb(85, 85, 85)",
    boxShadow: "0 0 2px rgba(0, 0, 0, 0.24), 0 1px 2px rgba(0, 0, 0, 0.28)",
  },
  replySnippetText: {
    margin: 0,
    fontSize: "12px",
    color: "#ccc",
  },
  contextMenu: {
    display: "flex",
    gap: "2px",
    position: "absolute",
    backgroundColor: "#2A2A2A",
    borderRadius: "4px",
    padding: "5px",
    zIndex: 10,
    top: "-10px",
    right: "0",
  },
  contextButton: {
    background: "none",
    border: "none",
    color: "#fff",
    padding: "5px",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
  },
};

export default ChatMessages;
