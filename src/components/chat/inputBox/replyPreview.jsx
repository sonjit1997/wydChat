import { FaRegFileAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const ReplyPreview = ({ replyingTo, onCancel }) => {
  if (!replyingTo) return null;

  const isFile = replyingTo.messageType !== "text";
  const isFileImage = replyingTo.messageType === "image";

  return (
    <div style={styles.preview}>
      {isFile ? (
        isFileImage ? (
          <img src={replyingTo.message} alt="Preview" style={styles.image} />
        ) : (
          <p style={styles.previewText}>
            <FaRegFileAlt style={{ marginRight: "5px" }} />
            {replyingTo.fileName}
          </p>
        )
      ) : (
        <p style={styles.previewText}>
          {replyingTo.message.slice(0, 50)}
          {replyingTo.message.length > 50 ? "..." : ""}
        </p>
      )}
      <button onClick={onCancel} style={styles.cancelButton}>
        <MdDelete />
      </button>
    </div>
  );
};

const styles = {
  preview: {
    padding: "12px",
    backgroundColor: "#2A2A2A",
    width: "fit-content",
    display: "flex",
    margin: "11px",
    borderRadius: "4px",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeft: "4px solid rgb(31 111 76)",
    position: "relative",
  },
  previewText: {
    margin: 0,
    fontSize: "12px",
    color: "#ccc",
  },
  cancelButton: {
    position: "absolute",
    top: "0px",
    left: "94%",
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "12px",
  },
  image: {
    maxWidth: "100px",
    maxHeight: "100px",
    borderRadius: "4px",
  },
};

export default ReplyPreview;
