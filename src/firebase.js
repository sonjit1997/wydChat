import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const signInUser = async () => {
  const provider = new GoogleAuthProvider();

  try {
    // Sign in with Google popup
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Reference the user document with the UID as the document ID
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // If the user doesn't exist in Firestore, create a new document
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        username: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        bio: "I am available :)",
        createdAt: new Date(),
      });
    }

    return user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};
