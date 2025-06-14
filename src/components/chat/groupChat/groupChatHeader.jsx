import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import { useState } from "react";
import { FaEllipsisV, FaUsers } from "react-icons/fa";
import AddMembers from "./addMembers";
import ChangeGroupName from "./changeGroupName";

const GroupChatHeader = ({ selectedGroup, groupMembers }) => {
  const [showChangeGroupName, setShowChangeGroupName] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);

  return (
    <div style={styles.header}>
      <div style={styles.subheader}>
        <div style={styles.avatar}>
          <FaUsers size={22} color="#fff" />
        </div>
        <h2 style={styles.username}>{selectedGroup?.groupName}</h2>
      </div>

      <Menu
        menuButton={<MenuButton className='menu-icon'><FaEllipsisV size={20} color="#fff" /></MenuButton>}
        transition
        theming="dark"
      >
        <MenuItem onClick={() => setShowChangeGroupName(true)}>
          Change Group Name
        </MenuItem>
        <MenuItem onClick={() => setShowAddMembers(true)}>
          Add New Members
        </MenuItem>
      </Menu>

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
};

export default GroupChatHeader;

