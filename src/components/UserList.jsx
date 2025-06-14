import useFormattedMessageDateNew from "@/hooks/useFormattedMessageDateNew";
import { useUserListData } from "@/hooks/useUserListData";
import { useAuthStore } from "@/store/useAuthStore";
import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import { useEffect, useRef, useState } from "react";
import { FaEllipsisV, FaUsers } from "react-icons/fa";
import CreateGroup from "./chat/groupChat/createGroup";
import ProfileSetup from "./profileSetup";

const UserList = ({ manuallyLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const menuRef = useRef(null);
  const { formatMessageDate } = useFormattedMessageDateNew();
  const {
    allUser,
    logedInUser,
    selectedUserOrGroup,
    setSelectedUserOrGroup,
    isGroupChanged,
  } = useAuthStore();

  const { combinedList, groups, refreshAll } = useUserListData();

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectUserToChat = (item) => {
    setSelectedUserOrGroup({
      ...item,
      ...(item.type === "group"
        ? { groupId: item.groupId }
        : { userId: item.uid }),
    });
  };

  const handleRefresh = async () => {
    await refreshAll();
    setShowMenu(false);
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h3 style={styles.headerText}>Wydchat</h3>

        {/* Menu */}
        <Menu
          menuButton={
            <MenuButton className='menu-icon'>
              <FaEllipsisV size={20} color="#fff" />
            </MenuButton>
          }
          transition
        >
          <MenuItem onClick={() => setShowCreateGroup(true)}>
            New Group
          </MenuItem>
          <MenuItem onClick={handleRefresh}>Refresh</MenuItem>
          <MenuItem onClick={() => setShowProfile(true)}>Profile</MenuItem>
          <MenuItem onClick={() => manuallyLogout()}>Logout</MenuItem>
        </Menu>
      </div>

      {/* List */}
      <div style={styles.list}>
        {combinedList?.map((item, i) => (
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
            {item.type === "group" ? (
              <div style={styles.groupIcon}>
                <FaUsers size={22} color="#fff" />
              </div>
            ) : item.photoURL ? (
              <img
                src={item.photoURL}
                alt="User Avatar"
                style={styles.avatarImage}
              />
            ) : (
              <div style={styles.avatar}>
                {item?.username?.charAt(0).toUpperCase()}
              </div>
            )}

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
              currentUserPublicKey={logedInUser?.publicKey}
              setShowCreateGroup={setShowCreateGroup}
            />
          </div>
        </div>
      )}

      {/* Profile Popup */}
      {showProfile && (
        <div style={styles.popupOverlay} onClick={() => setShowProfile(false)}>
          <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowProfile(false)}
              style={styles.closeButton}
            >
              ✖
            </button>
            <ProfileSetup setShowProfile={setShowProfile} />
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
  avatarImage: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: "10px",
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
