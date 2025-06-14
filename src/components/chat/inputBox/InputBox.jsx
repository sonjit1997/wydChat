import { useEffect, useRef } from "react";
import LoadingSpinner from "@/components/loadingSpinner";
import VoiceRecorder from "./voiceRecorder";
import FileShare from "./fileShare";
import ReplyPreview from "./replyPreview";

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
  isLoading,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  return (
    <div style={styles.inputContainer}>
      <div style={styles.formContainer}>
        <ReplyPreview replyingTo={replyingTo} onCancel={cancelReply} />
        <form onSubmit={sendMessage} style={styles.form}>
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

          <FileShare
            file={file}
            setFile={setFile}
            clearFileInput={clearFileInput}
          />

          <VoiceRecorder setFile={setFile} file={file} />

          <button
            type="submit"
            style={{
              ...styles.button,
              color: text || file ? "#fff" : "rgb(223, 223, 223)",
              cursor: text || file ? "pointer" : "",
            }}
          >
            {isLoading ? <LoadingSpinner /> : "➤"}
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
    backgroundColor: "transparent",
    border: "none",
    margin: "8px 6px",
    paddingLeft: "11px",
    fontSize: "22px",
    borderLeft: "1px solid rgb(223, 223, 223)",
  },
};

export default InputBox;
