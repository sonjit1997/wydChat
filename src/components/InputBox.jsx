import { useEffect, useRef } from "react";

const InputBox = ({
  sendMessage,
  text,
  setText,
  handleTyping,
  replyingTo,
  cancelReply,
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
        {replyingTo && (
          <div style={styles.replyPreview}>
            <p style={styles.replyText}>
              {replyingTo.text.slice(0, 50)}
              {replyingTo.text.length > 50 ? "..." : ""}
            </p>
            <button onClick={cancelReply} style={styles.cancelButton}>
              X
            </button>
          </div>
        )}

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

          <button
            type="submit"
            style={{
              ...styles.button,
              color: text ? "#fff" : "rgb(85, 85, 85)",
              cursor: text ? "pointer" : "",
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
    borderBottom:'4px solid rgb(85, 85, 85)',
  },
  form: {
    display: "flex",
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
  replyPreview: {
    padding: "12px",
    backgroundColor: "#2A2A2A",
    width: "fit-content",
    display: "flex",
    margin: "11px",
    borderRadius: "4px",
    justifyContent: "space-between",
    alignItems: "center",
  },
  replyText: {
    margin: 0,
    fontSize: "12px",
    color: "#ccc",
  },
  cancelButton: {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default InputBox;
