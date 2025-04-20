import React from "react";

const DirectChatHeader = ({selectedUserOrGroup}) => {
  return (
    <div style={styles.header}>
      <div style={styles.avatar}>
        {selectedUserOrGroup.username.charAt(0).toUpperCase()}
      </div>
      <h2 style={styles.username}>
        {selectedUserOrGroup.username.charAt(0).toUpperCase() +
          selectedUserOrGroup.username.slice(1)}
      </h2>
    </div>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    padding: "11px",
    backgroundColor: "rgb(28 28 28)",
    color: "#fff",
  },
  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    border: "1px solid #1F1F1F",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
    marginRight: "10px",
    color: "rgb(28 28 28)",
  },
  username: {
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default DirectChatHeader;
