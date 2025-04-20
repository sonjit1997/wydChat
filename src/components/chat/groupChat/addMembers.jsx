import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "@/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { encryptWithPublicKey } from "@/utils/cryptoUtils";

const AddMembers = ({ selectedGroup, onClose }) => {
  const { allUser, logedInUser, setIsGroupChanged, isGroupChanged } =
    useAuthStore();
  const [loading, setLoading] = useState(false);

  // Check if a user is already in the group
  const isUserInGroup = (uid) => selectedGroup.memberIds.includes(uid);

  const handleAddMember = async (newMember) => {


    if (!newMember || !newMember.uid || !newMember.publicKey) {
      alert("Invalid member selection.");
      return;
    }

    setLoading(true);

    try {
      const groupRef = doc(db, "groups", selectedGroup.groupId);

      // Encrypt the group key for the new member
      const newEncryptedKey = {
        uid: newMember.uid,
        encryptedKey: encryptWithPublicKey(
          selectedGroup.groupKey,
          newMember.publicKey
        ),
      };

      // 🔹 Firestore Update: Add new member to `memberIds` & append new key to `encryptedKeys`
      await updateDoc(groupRef, {
        memberIds: arrayUnion(newMember.uid), // Firestore handles array updates efficiently
        encryptedKeys: arrayUnion(newEncryptedKey), // Add new encrypted key
      });

      setIsGroupChanged(!isGroupChanged);
    } catch (error) {
      console.error("Failed to add member:", error);
      alert("Failed to add member.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
 
    try {
      const groupRef = doc(db, "groups",  selectedGroup.groupId);

      // Filter out the user from `memberIds`
      const updatedMembers = selectedGroup.memberIds.filter((id) => id !== userId);

      // Filter out the user from `encryptedKeys`
      const updatedEncryptedKeys = selectedGroup.encryptedKeys.filter(
        (keyObj) => keyObj.uid !== userId
      );

      // Update the group in Firestore
      await updateDoc(groupRef, {
        memberIds: updatedMembers,
        encryptedKeys: updatedEncryptedKeys,
      });

      setIsGroupChanged(!isGroupChanged);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        <h3 style={styles.title}>Manage Group Members</h3>
        <ul style={styles.userList}>
          {allUser.map((user) => (
            <li key={user.uid} style={styles.userItem}>
              <span>{user.username}</span>

              {logedInUser.uid !== user.uid &&
                (isUserInGroup(user.uid) ? (
                  <button
                    style={styles.removeButton}
                    onClick={() => handleRemoveMember(user.uid)}
                    disabled={loading}
                  >
                    -
                  </button>
                ) : (
                  <button
                    style={styles.addButton}
                    onClick={() => handleAddMember(user)}
                    disabled={loading}
                  >
                    +
                  </button>
                ))}
            </li>
          ))}
        </ul>
        <button style={styles.cancelButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

// Styling
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
    backgroundColor: "#1F1F1F",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    color: "#fff",
  },
  title: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  userList: {
    listStyle: "none",
    padding: 0,
  },
  userItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #ddd",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "6px 11px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  removeButton: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "6px 11px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelButton: {
    marginTop: "10px",
    backgroundColor: "#777",
    color: "white",
    padding: "8px 14px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default AddMembers;
