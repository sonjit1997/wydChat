import { useAuthStore } from "@/store/useAuthStore";
import UserList from "../userList";
import Chat from "./chat";
import ChatPlaceholder from "./chatPlaceholder";

const ChatLayout = ({ manuallyLogout, socket }) => {
  const { selectedUserOrGroup, logedInUser } = useAuthStore();

  return (
    <div style={styles.container}>
      {/* Left Sidebar - User List */}
      <div style={styles.userListContainer}>
        <UserList manuallyLogout={manuallyLogout} socket={socket} />
      </div>

      {/* Right Side - Chat Details */}
      <div style={styles.chatContainer}>
        {selectedUserOrGroup ? (
          <Chat socket={socket} />
        ) : (
          <ChatPlaceholder logedInUser={logedInUser} />
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100%",
    backgroundColor: "rgb(28 28 28)",
  },
  userListContainer: {
    width: "25%",
    borderRight: "1px solid #333",
    backgroundColor: "#1F1F1F",
  },
  chatContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F1F1F",
  },
  placeholderText: {
    color: "#aaa",
  },
};

export default ChatLayout;
