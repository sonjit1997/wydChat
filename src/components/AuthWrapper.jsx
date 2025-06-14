import { NotificationProvider } from "@/context/NotificationContext.jsx";
import { useAuthStore } from "@/store/useAuthStore.js";
import {
  decryptPrivateKey,
  encryptPrivateKey,
  generateKeyPair,
} from "@/utils/cryptoUtils.js";
import {
  getEncryptedPrivateKey,
  saveEncryptedPrivateKey,
  savePublicKeyToFirestore,
} from "@/utils/firestoreUtils.js";
import {
  deletePrivateKey,
  getPrivateKey,
  savePrivateKey,
} from "@/utils/indexedDBUtils.js";
import { useSocket } from "@/utils/socketUtil.js";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { auth } from "../firebase.js";
import ChatLayout from "./chat/chatLayout.jsx";
import NotificationPanel from "./notificationPanel.jsx";
import PassphraseModal from "./passphraseModal.jsx";
import SignIn from "./signIn.jsx";
export default function AuthWrapper() {
  const socket = useSocket();
  const [user, setUser] = useState(null);
  const { setLogedInUser, logedInUser, logout } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [pendingEncryptedKey, setPendingEncryptedKey] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (newUser) => {
      if (newUser && socket) {
        setUser(newUser);
        socket.connect();
        socket.emit("register", newUser.uid);

        const existingPrivateKeyInIndexDB = await getPrivateKey(newUser.uid);
        if (!existingPrivateKeyInIndexDB) {
          const encryptedPrivateKey = await getEncryptedPrivateKey(newUser.uid);
          if (!encryptedPrivateKey) {
            setModalMode("set");
            setModalOpen(true);
          } else {
            setModalMode("enter");
            setPendingEncryptedKey(encryptedPrivateKey);
            setModalOpen(true);
          }
        }
      } else {
        socket.disconnect();
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [socket, setLogedInUser]);

  // ✅ Update Zustand state only when `user` changes to prevent infinite loop
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        const finalData = {
          ...user,
          storeData: userSnap.exists() ? userSnap.data() : {},
        };

        setLogedInUser(finalData);
      }
    };

    fetchData();
  }, [user]);

  const handlePassphraseSubmit = async (passphrase) => {
    if (modalMode === "set") {
      const { publicKey, privateKey } = generateKeyPair();
      const encryptedKey = encryptPrivateKey(privateKey, passphrase);
      await saveEncryptedPrivateKey(user.uid, encryptedKey);
      await savePublicKeyToFirestore(user.uid, publicKey);
      await savePrivateKey(user.uid, privateKey);
    } else if (modalMode === "enter") {
      const decryptedPrivateKey = decryptPrivateKey(
        pendingEncryptedKey,
        passphrase
      );
      if (!decryptedPrivateKey) {
        alert("Incorrect passphrase. Unable to decrypt messages.");
        return;
      }
      await savePrivateKey(user.uid, decryptedPrivateKey);
    }
    setModalOpen(false);
  };

  const manuallyLogout = async () => {
    try {
      await signOut(auth);
      await deletePrivateKey(user.uid);
      setUser(null);
      setLogedInUser(null);
      logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!logedInUser) return <SignIn onSignIn={setUser} />;

  return (
    <>
      <PassphraseModal
        isOpen={modalOpen}
        title={
          modalMode === "set"
            ? "Set a Secure 6-Digit Passcode"
            : "Enter Your 6-Digit Security Passcode"
        }
        onSubmit={handlePassphraseSubmit}
      />
      <NotificationProvider socket={socket}>
        <NotificationPanel />
        <ChatLayout
          manuallyLogout={manuallyLogout}
          currentUser={user}
          socket={socket}
        />
      </NotificationProvider>
    </>
  );
}
