import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

const EditGroup = ({
  selectedGroup,
  usersList,
  onClose,
  onGroupUpdated,
  currentUserId,
}) => {
  const [groupName, setGroupName] = useState(selectedGroup.groupName);
  const [groupMembers, setGroupMembers] = useState(selectedGroup.memberIds);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);

  // Fetch available users who are not yet in the group
  useEffect(() => {
    const fetchAvailableUsers = () => {
      const filtered = usersList.filter(
        (user) => !groupMembers.includes(user.uid) && user.uid !== currentUserId
      );
      setAvailableUsers(filtered);
    };

    fetchAvailableUsers();
  }, [groupMembers, usersList, currentUserId]);

  const handleUpdateGroupName = async () => {
    if (groupName.trim() === selectedGroup.groupName) return;

    setNameLoading(true);
    try {
      await updateDoc(doc(db, "groups", selectedGroup.groupId), { groupName });
      onGroupUpdated();
    } catch (error) {
      console.error("Error updating group name:", error);
      alert("Failed to update group name");
    } finally {
      setNameLoading(false);
    }
  };

  const handleUpdateGroupMembers = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "groups", selectedGroup.groupId), {
        memberIds: groupMembers,
      });
      onGroupUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating group members:", error);
      alert("Failed to update group members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = (user) => {
    setGroupMembers((prev) => [...prev, user.uid]);
    setAvailableUsers((prev) => prev.filter((u) => u.uid !== user.uid));
  };

  const handleRemoveMember = (uid) => {
    if (uid === currentUserId) return;
    setGroupMembers((prev) => prev.filter((id) => id !== uid));
    const removedUser = usersList.find((user) => user.uid === uid);
    if (removedUser) setAvailableUsers((prev) => [...prev, removedUser]);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        {/* Group Name Section */}
        <div style={styles.section}>
          <label style={styles.label}>Group Name:</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={styles.input}
          />
          <button
            onClick={handleUpdateGroupName}
            style={styles.saveButton}
            disabled={
              nameLoading || groupName.trim() === selectedGroup.groupName
            }
          >
            {nameLoading ? "...." : "Save"}
          </button>
        </div>

        {/* Members List */}
        {/* <div style={styles.section}>
          <h3>Group Members</h3>
          <ul style={styles.list}>
            {groupMembers.map((uid) => {
              const user = usersList.find((u) => u.uid === uid);
              return (
                <li key={uid} style={styles.listItem}>
                  {user ? user.username : uid}
                  {uid !== currentUserId && (
                    <button
                      style={styles.removeButton}
                      onClick={() => handleRemoveMember(uid)}
                    >
                      -
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div> */}

        {/* <hr style={styles.divider} /> */}

        {/* Available Users */}

        {/* <div style={styles.section}>
          <h3>Add New Members</h3>
          <ul style={styles.list}>
            {availableUsers.map((user) => (
              <li key={user.uid} style={styles.listItem}>
                {user.username}
                <button
                  style={styles.addButton}
                  onClick={() => handleAddMember(user)}
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        </div> */}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  content: {
    backgroundColor: "#1F1F1F",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0px 5px 14px rgba(0, 0, 0, 0.3)",
    width: "80%",
    maxWidth: "400px",
    // textAlign: "center",
    // position: "relative",
  },
  section: { marginBottom: "14px" },
  label: { display: "block", fontWeight: "bold", marginBottom: "5px" },
  input: {
    padding: "10px",
    width: "213px",
    borderRadius: "5px",
    border: "none",
    marginBottom: "10px",
    backgroundColor: "#27293D",
    color: "#fff",
  },
  list: { listStyle: "none", padding: 0 },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 0",
  },
  divider: { borderTop: "1px solid #ccc", margin: "10px 0" },
  removeButton: {
    backgroundColor: "#ff5a5f",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  saveButton: {
    backgroundColor: "rgb(57 70 85)",
    color: "#fff",
    border: "none",
    padding: "10.5px 14px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "10px",
  },
};

export default EditGroup;
