import { db } from "@/firebase";
import { encryptWithPublicKey, generateAESKey } from "@/utils/cryptoUtils";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";

const CreateGroup = ({
  usersList,
  currentUserId,
  currentUserPublicKey,
  setShowCreateGroup,
}) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleToggleMember = (user) => {
    setSelectedMembers((prev) =>
      prev.some((member) => member.uid === user.uid)
        ? prev.filter((member) => member.uid !== user.uid)
        : [...prev, { uid: user.uid, publicKey: user.publicKey }]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }

    if (selectedMembers.length < 1) {
      alert("Please select at least one member.");
      return;
    }

    setLoading(true);

    try {
      // Generate a symmetric AES key for group encryption
      const groupKey = generateAESKey();

      // Get only the user IDs from selected members
      const members = [
        { uid: currentUserId, publicKey: currentUserPublicKey },
        ...selectedMembers,
      ]; // Store as objects

      // Encrypt the group key for each member using their public key
      const encryptedKeys = members.map((member) => {
        return {
          uid: member.uid,
          encryptedKey: encryptWithPublicKey(groupKey, member.publicKey),
        };
      });

      // 🔹 Create a new group document in Firestore
      await addDoc(collection(db, "groups"), {
        groupName,
        create_by: currentUserId,
        memberIds: members.map((m) => m.uid), // Store only UID array
        encryptedKeys, // Now an array of objects
        createdAt: serverTimestamp(),
        groupKey: groupKey,
      });

      setGroupName("");
      setSelectedMembers([]);
      setShowCreateGroup(false);
    } catch (error) {
      alert("Failed to create group");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        style={styles.input}
      />

      <div style={styles.dropdown}>
        <p style={styles.label}>Select Members:</p>
        <div style={styles.list}>
          {usersList.map((user) => (
            <div
              key={user.uid}
              style={{
                ...styles.userItem,
                backgroundColor: selectedMembers.some(
                  (member) => member.uid === user.uid
                )
                  ? "#007BFF"
                  : "#2A2D40",
              }}
              onClick={() => handleToggleMember(user)}
            >
              <span>{user.username}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleCreateGroup}
        style={styles.button}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Group"}
      </button>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#1F1F1F",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    color: "#fff",
  },
  title: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  input: {
    padding: "10px",
    width: "213px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "10px",
    backgroundColor: "#27293D",
    color: "#fff",
  },
  dropdown: {
    textAlign: "left",
    marginBottom: "10px",
  },
  label: {
    fontSize: "14px",
    marginBottom: "5px",
  },
  list: {
    maxHeight: "150px",
    overflowY: "auto",
    border: "1px solid #444",
    borderRadius: "5px",
    padding: "5px",
    backgroundColor: "#27293D",
  },
  userItem: {
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background 0.3s",
    marginBottom: "5px",
    color: "#fff",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default CreateGroup;
