import { useState, useRef, useEffect } from "react";
import { FaEllipsisV, FaUsers } from "react-icons/fa";
import AddMembers from "./addMembers";
import ChangeGroupName from "./changeGroupName";

const GroupChatHeader = ({ selectedGroup, groupMembers }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showChangeGroupName, setShowChangeGroupName] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const menuRef = useRef(null);

  // Handle click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={styles.header}>
      <div style={styles.subheader}>
        <div style={styles.avatar}>
          <FaUsers size={22} color="#fff" />
        </div>
        <h2 style={styles.username}>{selectedGroup?.groupName}</h2>
      </div>
      <div
        style={styles.menuIcon}
        onClick={() => setMenuVisible(!menuVisible)}
        ref={menuRef}
      >
        <FaEllipsisV size={20} color="#fff" />
        {menuVisible && (
          <div style={styles.menuDropdown}>
            <div
              style={styles.menuItem}
              onClick={() => {
                setShowChangeGroupName(true);
                setMenuVisible(false);
              }}
            >
              Change Group Name
            </div>
            <div
              style={styles.menuItem}
              onClick={() => {
                setShowAddMembers(true);
                setMenuVisible(false);
              }}
            >
              Add New Members
            </div>
          </div>
        )}
      </div>

      {showChangeGroupName && (
        <ChangeGroupName
          selectedGroup={selectedGroup}
          onClose={() => setShowChangeGroupName(false)}
        />
      )}

      {showAddMembers && (
        <AddMembers
          selectedGroup={selectedGroup}
          usersList={groupMembers}
          onClose={() => setShowAddMembers(false)}
        />
      )}
    </div>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 10,
    padding: "11px",
    backgroundColor: "rgb(28 28 28)",
  },
  subheader: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    backgroundColor: "#4CAF50",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "11px",
    cursor: "pointer",
  },
  username: {
    fontSize: "14px",
    fontWeight: "500",
  },
  menuIcon: {
    cursor: "pointer",
  },
  menuDropdown: {
    position: "absolute",
    top: "60px",
    right: "10px",
    backgroundColor: "#333",
    borderRadius: "5px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
    zIndex: 1000,
    padding: "5px 0",
  },
  menuItem: {
    padding: "10px 14px",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.3s",
    fontSize: "13px",
  },
  menuItemLast: {
    borderBottom: "none",
  },
};

export default GroupChatHeader;
