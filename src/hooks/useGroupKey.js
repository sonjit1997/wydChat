import { useState, useEffect } from "react";
import { decryptWithPrivateKey } from "../utils/cryptoUtils";
import { getPrivateKey } from "../utils/indexedDBUtils";

const useGroupKey = (selectedGroup,logedInUser) => {
  const [groupKey, setGroupKey] = useState(null);

 
  useEffect(() => {
    const fetchGroupKey = async () => {
      if (!selectedGroup?.groupId || !logedInUser?.uid) return;
  
      const encryptedGroupKey = selectedGroup.encryptedKeys.find(
        (key) => key.uid === logedInUser.uid
      )?.encryptedKey;

      if (!encryptedGroupKey) {
        console.error("No encrypted group key for logedInUser!");
        setGroupKey(null);
        return;
      }

      const privateKey = await getPrivateKey(logedInUser.uid);
      if (!privateKey) {
        console.error("User's private key not found!");
        setGroupKey(null);
        return;
      }

      const decryptedKey = decryptWithPrivateKey(encryptedGroupKey, privateKey);
      if (!decryptedKey) {
        console.error("Failed to decrypt group AES key!");
        setGroupKey(null);
        return;
      }

      setGroupKey(decryptedKey);
    };

    fetchGroupKey();
  }, [selectedGroup, logedInUser]);

  return groupKey;
};

export default useGroupKey;
