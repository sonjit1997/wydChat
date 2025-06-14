import { Suspense, lazy } from "react";

const VoiceCall = lazy(() => import("@/components/call/voiceCalling"));

const DirectChatHeader = ({ selectedUser, logedInUser, socket }) => {
  return (
    <div style={styles.header}>
      <div style={styles.headerChild}>
        {selectedUser.photoURL ? (
          <img
            src={selectedUser.photoURL}
            alt="User Avatar"
            style={styles.avatarImage}
          />
        ) : (
          <div style={styles.avatar}>
            {selectedUser.username.charAt(0).toUpperCase()}
          </div>
        )}

        <h2 style={styles.username}>
          {selectedUser.username.charAt(0).toUpperCase() +
            selectedUser.username.slice(1)}
        </h2>
      </div>
      <div>
        <Suspense fallback={null}>
          {/* <VoiceCall
            logedInUser={logedInUser}
            selectedUser={selectedUser}
            websocket={socket}
          /> */}
        </Suspense>
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "11px 37px",
    backgroundColor: "rgb(28 28 28)",
    color: "#fff",
  },
  headerChild: {
    display: "flex",
    alignItems: "center",
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
  avatarImage: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: "10px",
  },

  username: {
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default DirectChatHeader;
