import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "@/firebase";
import { useAuthStore } from "@/store/useAuthStore";
const ChangeGroupName = ({ selectedGroup, onClose }) => {
  const [newGroupName, setNewGroupName] = useState(selectedGroup.groupName);
  const { setIsGroupChanged, isGroupChanged } = useAuthStore();
  const [nameLoading, setNameLoading] = useState(false);

  const handleUpdateGroupName = async () => {
    if (newGroupName.trim() === selectedGroup.newGroupName) return;

    setNameLoading(true);
    try {
      await updateDoc(doc(db, "groups", selectedGroup.groupId), {
        groupName: newGroupName,
      });

      onClose();
      setIsGroupChanged(!isGroupChanged);
    } catch (error) {
      console.error("Error updating group name:", error);
      alert("Failed to update group name");
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        <h3 style={styles.title}>Change Group Name</h3>
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          style={styles.input}
        />
        <div style={styles.buttonContainer}>
          <button onClick={handleUpdateGroupName} style={styles.button}>
            Save
          </button>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "rgb(51, 51, 51)",
    padding: "20px",
    borderRadius: "8px",
    width: "300px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  input: {
    width: "-webkit-fill-available",
    padding: "8px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "8px 14px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "8px 14px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ChangeGroupName;
