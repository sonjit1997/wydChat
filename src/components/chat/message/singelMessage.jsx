import { useState } from "react";
import { FaEye, FaReply } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { MdDelete, MdEdit } from "react-icons/md";
import FilePreview from "../filePreview";
const MessageRenderer = ({
  messageObject,
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
  const {
    message,
    replyTo,
    isDeleted,
    createdAt,
    isEdited,
    senderName,
    seen,
    messageType,
    fileName,
  } = messageObject;

  const repliedToMessage = replyTo
    ? messages.find((msg) => msg.id === replyTo)
    : null;

  const isFileReply =
    repliedToMessage && repliedToMessage.message.includes("/api");

  const isFile = messageType !== "text" && fileName;
  const isFileImage = messageType === "image";

  const baseStyle = {
    padding: isFile && isFileImage ? undefined : "11px",
    borderRadius: isFile && isFileImage ? undefined : "4px",
    backgroundColor:
      isFile && isFileImage
        ? undefined
        : isSentByUser
        ? "rgb(37 53 46)"
        : "rgb(44 51 48)",
  };

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
          backgroundColor: isSentByUser
            ? "rgb(37 53 46 / 52%)"
            : "rgb(44 51 48 / 54%)",
        }}
      >
        <p style={styles.deletText}>
          This message has been deleted.{" "}
          {isSentByUser && (
            <button
              style={{
                cursor: "pointer",
                backgroundColor: "#1F6F4C",
                border: "none",
                color: "#fff",
                fontWeight: "600",
                borderRadius: "2px",
              }}
              onClick={() => handleDeleteMessage(messageObject, false)}
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
          ...baseStyle,
          cursor: canEdit ? "pointer" : "default",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
          maxWidth: "100%",
        }}
      >
        {repliedToMessage && (
          <div style={styles.replySnippet}>
            {isFileReply ? (
              <img
                src={repliedToMessage.message}
                alt={"Reply"}
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              />
            ) : (
              <p style={styles.replySnippetText}>
                {repliedToMessage.message.slice(0, 50)}
                {repliedToMessage.message.length > 50 ? "..." : ""}
              </p>
            )}
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
        ) : messageType === "text" ? (
          <p style={styles.text}>{message}</p>
        ) : isFile ? (
          messageType === "image" ? (
            <img
              src={message}
              alt={fileName}
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "5px",
              }}
            />
          ) : (
           <FilePreview fileName={fileName} fileUrl={message} />
          )
        ) : (
          <p style={styles.text}>{message}</p>
        )}
      </div>
      {showContextMenu && (
        <div style={styles.contextMenu}>
          <button
            title="Reply"
            onClick={() => handleReply(messageObject)}
            style={styles.contextButton}
          >
            <FaReply />
          </button>
          {canEdit && (
            <button
              title="Edit"
              onClick={() => handleEditMessage(messageObject)}
              style={styles.contextButton}
            >
              <MdEdit />
            </button>
          )}
          {isSentByUser && (
            <button
              title="Delete"
              onClick={() => handleDeleteMessage(messageObject, true)}
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
            .filter(Boolean)
            .map((seenUser, idx) => (
              <img
                title="Seen by"
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
            <FaEye style={styles.seen} title="Seen" />
          ) : (
            <FiSend style={styles.seen} title="Recived" />
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
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
  deletText: {
    margin: 0,
    color: "rgb(183 183 183 / 88%)",
    fontStyle: "italic",
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
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    borderRadius: "4px",
    padding: "5px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
    zIndex: 10,
    top: "0",
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
  fileDownload: {
    color: "#fff",
    cursor: "pointer",
    margin: "1px 0px 0px 7px",
  },
};

export default MessageRenderer;
