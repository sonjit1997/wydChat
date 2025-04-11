import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { IoEllipsisVertical } from "react-icons/io5";
import { useNotifications } from "../context/NotificationContext";
import { db } from "../firebase";
import useFormattedMessageDateNew from "../hooks/useFormattedMessageDateNew";
import { useAuthStore } from "../store/useAuthStore";
import CreateGroup from "./CreateGroup";
const UserList = ({ manuallyLogout }) => {
  const [groups, setGroups] = useState([]);
  const [combinedList, setCombinedList] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { formatMessageDate } = useFormattedMessageDateNew();
  const { notifications } = useNotifications();

  const {
    logedInUser,
    allUser,
    setAllUser,
    setSelectedUserOrGroup,
    selectedUserOrGroup,
    isGroupChanged,
    isUpdateLastConversation,
  } = useAuthStore();
  const menuRef = useRef(null);

  // Fetch Users (excluding logged-in user)
  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const userList = usersSnap.docs.map((doc) => ({
        type: "user",
        ...doc.data(),
      }));

      // Update logged-in user's publicKey if available
      const currentUserData = userList.find(
        (user) => user.uid === logedInUser?.uid
      );
      if (currentUserData) {
        logedInUser.publicKey = currentUserData.publicKey;
      }

      const filteredUsers = userList.filter(
        (user) => user.uid !== logedInUser?.uid
      );
      setAllUser(filteredUsers);
    };

    fetchUsers();
  }, [logedInUser]);

  // Fetch Groups where the logged-in user is a member
  useEffect(() => {
    const fetchGroups = async () => {
      const q = query(
        collection(db, "groups"),
        where("memberIds", "array-contains", logedInUser?.uid)
      );
      const querySnapshot = await getDocs(q);
      const groupsData = querySnapshot.docs.map((doc) => ({
        type: "group",
        groupId: doc.id,
        ...doc.data(),
      }));

      setGroups(groupsData);
    };

    fetchGroups();
  }, [logedInUser, showCreateGroup, isGroupChanged]);

  // Combine one-on-one users and groups based on last conversation timestamp
  useEffect(() => {
    const fetchLastConversations = async () => {
      if (!logedInUser) return;

      // Query all lastConversations where the logged-in user is a participant.
      const convoQuery = query(
        collection(db, "lastConversations"),
        where("participants", "array-contains", logedInUser.uid)
      );
      const convoSnap = await getDocs(convoQuery);
      const convoData = {};
      convoSnap.docs.forEach((doc) => {
        convoData[doc.id] = doc.data();
      });

      // For one-on-one chats, conversation id = sorted [logedInUser.uid, user.uid]
      const usersWithTimestamps = allUser.map((user) => {
        const conversationId = [logedInUser.uid, user.uid].sort().join("_");
        return {
          ...user,
          lastMessageAt: convoData[conversationId]?.lastMessageAt || null,
          lastMessage: convoData[conversationId]?.lastMessage || "",
        };
      });

      // For groups, conversation id = groupId
      const groupsWithTimestamps = groups.map((group) => ({
        ...group,
        lastMessageAt: convoData[group.groupId]?.lastMessageAt || null,
        lastMessage: convoData[group.groupId]?.lastMessage || "",
      }));

      // Merge the two lists
      const mergedList = [...usersWithTimestamps, ...groupsWithTimestamps];

      // Sort so that items with the most recent lastMessageAt come first.
      mergedList.sort((a, b) => {
        if (!a.lastMessageAt && !b.lastMessageAt) return 0;
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return b.lastMessageAt.toMillis() - a.lastMessageAt.toMillis();
      });

      setCombinedList(mergedList);
    };

    fetchLastConversations();
  }, [allUser, groups, logedInUser, isUpdateLastConversation, notifications]);

  // Handle click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to handle navigation
  const selectUserToChat = (item) => {
    setSelectedUserOrGroup({
      ...item,
      ...(item.type === "group"
        ? { groupId: item.groupId }
        : { userId: item.uid }),
    });
  };

  useEffect(() => {
    if (selectedUserOrGroup?.type === "group") {
      const updatedGroup = groups.find(
        (group) => group.groupId === selectedUserOrGroup.groupId
      );
      if (updatedGroup) {
        setSelectedUserOrGroup({
          ...updatedGroup,
          groupId: updatedGroup.groupId,
        });
      }
    }
  }, [isGroupChanged, groups]);

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h3 style={styles.headerText}>Wydchat</h3>

        {/* Three Dots Menu */}
        <div style={styles.menuContainer} ref={menuRef}>
          <IoEllipsisVertical
            size={20}
            color="#fff"
            style={styles.menuIcon}
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div style={styles.menu}>
              <div
                onClick={() => setShowCreateGroup(true)}
                style={styles.menuItem}
              >
                New Group
              </div>
              <div onClick={() => manuallyLogout()} style={styles.menuItem}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* List of Users & Groups sorted by last conversation */}
      <div style={styles.list}>
        {combinedList.map((item, i) => (
          <div
            key={i}
            onClick={() => selectUserToChat(item)}
            style={{
              ...styles.item,
              ...(selectedUserOrGroup &&
              (selectedUserOrGroup?.uid === item.uid ||
                selectedUserOrGroup?.groupId === item.groupId)
                ? styles.selectedItem
                : {}),
            }}
          >
            {/* Avatar or Group Icon */}
            <div
              style={item.type === "group" ? styles.groupIcon : styles.avatar}
            >
              {item.type === "group" ? (
                <FaUsers size={22} color="#fff" />
              ) : (
                // item?.username?.charAt(0).toUpperCase()
                item?.username?.charAt(0).toUpperCase()
              )}
            </div>

            {/* Name */}
            <div style={styles.info}>
              <div style={styles.name}>
                {item.type === "group"
                  ? item?.groupName?.charAt(0).toUpperCase() +
                    item?.groupName?.slice(1)
                  : item?.username?.charAt(0).toUpperCase() +
                    item?.username?.slice(1)}
                <span style={styles.info2}>
                  {item.lastMessageAt &&
                    ` ${formatMessageDate(item.lastMessageAt)}`}
                </span>
              </div>
              <span style={styles.lastMessage}>
                {item.lastMessage || "No messages yet"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Group Popup */}
      {showCreateGroup && (
        <div
          style={styles.popupOverlay}
          onClick={() => setShowCreateGroup(false)}
        >
          <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowCreateGroup(false)}
              style={styles.closeButton}
            >
              ✖
            </button>
            <CreateGroup
              usersList={allUser}
              currentUserId={logedInUser?.uid}
              currentUserPublicKey={logedInUser.publicKey}
              setShowCreateGroup={setShowCreateGroup}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    maxWidth: "500px",
    height: "100vh",
    overflowY: "auto",
    backgroundColor: "#1F1F1F",
    color: "#fff",
    position: "relative",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 10,
    padding: "18.3px 14px",
    backgroundColor: "rgb(28 28 28)",
  },
  headerText: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "500",
  },
  menuContainer: {
    position: "relative",
    cursor: "pointer",
  },
  menuIcon: {
    cursor: "pointer",
  },
  menu: {
    position: "absolute",
    top: "30px",
    right: "-10px",
    backgroundColor: "#333333",
    borderRadius: "5px",
    padding: "5px",
    boxShadow: "0px 4px 6px rgba(49, 49, 49, 0.3)",
    zIndex: 1000,
  },
  menuItem: {
    padding: "8px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    marginTop: "4px",
    padding: "6px",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  lastMessage: {
    fontSize: "12px",
    color: "#aaa",
    marginTop: "4px",
    maxWidth: "200px", // Adjust this value based on your design needs
    overflow: "hidden", // Hide overflow content
    textOverflow: "ellipsis", // Add ellipsis (...) when text is truncated
    whiteSpace: "nowrap", // Prevent text from wrapping to the next line
  },

  item: {
    display: "flex",
    alignItems: "center",
    padding: "9px 11px",
    borderRadius: "2px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
    marginRight: "14px",
    color: "rgb(28 28 28)",
  },
  groupIcon: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    backgroundColor: "#FF5733",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "14px",
  },
  info: {
    display: "flex",
    flexDirection: "column",
  },
  info2: {
    fontSize: "12px",
    fontWeight: "400",
  },
  name: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    width: "19vw",
  },

  /* Popup Styles */
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  popup: {
    backgroundColor: "#1F1F1F",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0px 5px 14px rgba(0, 0, 0, 0.3)",
    width: "80%",
    maxWidth: "400px",
    textAlign: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    color: "#333",
  },
  selectedItem: {
    background: "rgb(255 255 255 / 5%)", // Glass effect
    backdropFilter: "blur(15px)", // Blur effect
    transition: "background 0.3s ease",
  },
};

export default UserList;
