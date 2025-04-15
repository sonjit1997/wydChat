import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
const InputBox = ({
  sendMessage,
  text,
  setText,
  handleTyping,
  replyingTo,
  cancelReply,
  file,
  setFile,
  clearFileInput,
}) => {
  const inputRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for file input
  const [previewUrl, setPreviewUrl] = useState(null); // State for image preview URL

  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  useEffect(() => {
    if (clearFileInput && fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
      setPreviewUrl(null); // Clear the preview URL
    }
  }, [clearFileInput]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Check if it's an image and create a preview URL
      if (selectedFile.type.startsWith("image/")) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null); // No preview for non-images
      }
    }
  };

  // Clear selected file
  const cancelFile = () => {
    setFile(null); // Clear the file state
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl); // Revoke the preview URL to free memory
      setPreviewUrl(null);
    }
  };

  // Clean up preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl); // Revoke URL when component unmounts
      }
    };
  }, [previewUrl]);

  return (
    <div style={styles.inputContainer}>
      <div style={styles.formContainer}>
        {replyingTo && (
          <div style={styles.preview}>
            <p style={styles.previewText}>
              {replyingTo.message.slice(0, 50)}
              {replyingTo.message.length > 50 ? "..." : ""}
            </p>
            <button onClick={cancelReply} style={styles.cancelButton}>
              X
            </button>
          </div>
        )}

        {file && (
          <div style={styles.preview}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={file.name}
                style={{
                  maxWidth: "100px",
                  maxHeight: "100px",
                  borderRadius: "4px",
                }}
              />
            ) : (
              <p style={styles.previewText}>
                {file.name.slice(0, 50)}
                {file.name.length > 50 ? "..." : ""}
              </p>
            )}
            <button onClick={cancelFile} style={styles.cancelButton}>
              X
            </button>
          </div>
        )}

        <form onSubmit={sendMessage} style={styles.form}>
          {/* File Upload Button */}
          <label htmlFor="file-upload" style={styles.uploadButton}>
            <GrAttachment />
            <input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={styles.fileInput}
            />
          </label>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            style={styles.input}
          />

          {/* Send Button */}
          <button
            type="submit"
            style={{
              ...styles.button,
              color: text || file ? "#fff" : "rgb(85, 85, 85)",
              cursor: text || file ? "pointer" : "",
            }}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  inputContainer: {
    padding: "0px 62px 20px 60px",
  },
  formContainer: {
    backgroundColor: "rgb(28 28 28)",
    borderRadius: "10px",
    border: "1px solid rgb(85 85 85)",
    borderBottom: "4px solid rgb(31 111 76)",
  },
  form: {
    display: "flex",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "8px 11px",
    outline: "none",
    border: "none",
    backgroundColor: "transparent",
    color: "#fff",
  },
  button: {
    padding: "11px 14px",
    backgroundColor: "transparent",
    border: "none",
    margin: "0px 11px",
    fontSize: "23px",
  },
  uploadButton: {
    padding: "11px 14px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    // color: "#fff",
  },
  fileInput: {
    display: "none",
  },

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
    left: "95%",
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default InputBox;
