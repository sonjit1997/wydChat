import React from "react";

const ChatPlaceholder = () => {
  return (
    <div style={styles.container}>
      <img src="/Wechat.gif" alt="Chat Animation" style={styles.gif} />
      <p style={styles.text}>Select anyone to start chat!</p>
    </div>
  );
};
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center",
  },
  gif: {
    width: "160px",
    height: "auto",
    filter: "brightness(0) invert(1)",
  },
  text: {
    color: "white",
    fontSize: "1.2rem",
    fontWeight: "500",
    marginTop: "10px",
  },
};

export default ChatPlaceholder;
