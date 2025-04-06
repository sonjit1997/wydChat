export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ChatAppDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "userId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Save private key to IndexedDB
export async function savePrivateKey(userId, privateKey) {
  const db = await openDatabase();
  const transaction = db.transaction("keys", "readwrite");
  const store = transaction.objectStore("keys");
  store.put({ userId, privateKey });
}

// Get private key from IndexedDB
export async function getPrivateKey(userId) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("keys", "readonly");
    const store = transaction.objectStore("keys");
    const request = store.get(userId);

    request.onsuccess = () => resolve(request.result?.privateKey || null);
    request.onerror = (event) => reject(event.target.error);
  });
}

// ✅ Delete private key from IndexedDB
export async function deletePrivateKey(userId) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("keys", "readwrite");
    const store = transaction.objectStore("keys");
    const request = store.delete(userId);

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event.target.error);
  });
}
