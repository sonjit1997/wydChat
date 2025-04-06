import { db } from "../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";

/**
 * Save user's public key to Firestore
 * @param {string} userId - The ID of the user
 * @param {string} publicKey - The user's public key
 */
export async function savePublicKeyToFirestore(userId, publicKey) {
  try {
    await setDoc(doc(db, "users", userId), { publicKey }, { merge: true });
    console.log("Public key saved successfully!");
  } catch (error) {
    console.error("Error saving public key:", error);
  }
}

/**
 * Save encrypted private key to Firestore
 * @param {string} userId - The ID of the user
 * @param {string} encryptedPrivateKey - The encrypted private key
 */
export async function saveEncryptedPrivateKey(userId, encryptedPrivateKey) {
  try {
    await setDoc(doc(db, "users", userId), { encryptedPrivateKey }, { merge: true });
    console.log("Encrypted private key saved successfully!");
  } catch (error) {
    console.error("Error saving encrypted private key:", error);
  }
}

/**
 * Get encrypted private key from Firestore
 * @param {string} userId - The ID of the user
 * @returns {Promise<string|null>} - The encrypted private key or null if not found
 */
export async function getEncryptedPrivateKey(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists() && userDoc.data().encryptedPrivateKey) {
      return userDoc.data().encryptedPrivateKey;
    }
    return null;
  } catch (error) {
    console.error("Error fetching encrypted private key:", error);
    return null;
  }
}
