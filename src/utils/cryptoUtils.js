import forge from "node-forge";

/**
 * Generate RSA Key Pair (2048-bit)
 * @returns {Object} { publicKey, privateKey }
 */
export function generateKeyPair() {
  const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  return {
    publicKey: forge.pki.publicKeyToPem(keyPair.publicKey),
    privateKey: forge.pki.privateKeyToPem(keyPair.privateKey),
  };
}

/**
 * Generate a random AES key (256-bit)
 * @returns {string} - The AES key as a Base64 encoded string
 */
export function generateAESKey() {
  const key = forge.random.getBytesSync(32); // 256-bit key
  return forge.util.encode64(key); // Return Base64 encoded key
}

/**
 * Encrypts the private key using AES encryption.
 * @param {string} privateKeyPem - The private key in PEM format.
 * @param {string} passphrase - The passphrase provided by the user.
 * @returns {string} - The encrypted private key (Base64 encoded).
 */
export function encryptPrivateKey(privateKeyPem, passphrase) {
  const key = forge.pkcs5.pbkdf2(passphrase, "salt", 10000, 32); // Derive a strong key
  const iv = forge.random.getBytesSync(16); // Generate a random IV
  const cipher = forge.cipher.createCipher("AES-CBC", key);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(privateKeyPem));
  cipher.finish();

  const encrypted = cipher.output.getBytes();
  const encryptedData = forge.util.encode64(iv + encrypted); // Store IV with encrypted data

  return encryptedData;
}

/**
 * Decrypts the encrypted private key using AES decryption.
 * @param {string} encryptedPrivateKey - The encrypted private key (Base64 encoded).
 * @param {string} passphrase - The passphrase provided by the user.
 * @returns {string|null} - The decrypted private key or null if decryption fails.
 */
export function decryptPrivateKey(encryptedPrivateKey, passphrase) {
  try {
    const key = forge.pkcs5.pbkdf2(passphrase, "salt", 10000, 32);
    const encryptedBytes = forge.util.decode64(encryptedPrivateKey);

    const iv = encryptedBytes.slice(0, 16); // Extract IV
    const encrypted = encryptedBytes.slice(16); // Extract encrypted data

    const decipher = forge.cipher.createDecipher("AES-CBC", key);
    decipher.start({ iv });
    decipher.update(forge.util.createBuffer(encrypted));
    const success = decipher.finish();

    if (!success) throw new Error("Decryption failed!");

    return decipher.output.toString();
  } catch (error) {
    console.error("Error decrypting private key:", error);
    return null;
  }
}

/**
 * Encrypt an AES key using a recipient's public key.
 * @param {string} aesKey - The AES key in Base64 format.
 * @param {string} publicKeyPem - The recipient's public key in PEM format.
 * @returns {string} - The encrypted AES key (Base64 encoded).
 */
export function encryptWithPublicKey(aesKey, publicKeyPem) {
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const encryptedBytes = publicKey.encrypt(
      forge.util.decode64(aesKey),
      "RSA-OAEP"
    );
    return forge.util.encode64(encryptedBytes); // Convert to Base64 for storage
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
}


/**
 * Decrypt an AES key using the recipient's private key.
 * @param {string} encryptedAesKey - The encrypted AES key (Base64 encoded).
 * @param {string} privateKeyPem - The recipient's private key in PEM format.
 * @returns {string} - The decrypted AES key in Base64 format.
 */
export function decryptWithPrivateKey(encryptedAesKey, privateKeyPem) {
  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const decryptedBytes = privateKey.decrypt(
      forge.util.decode64(encryptedAesKey),
      "RSA-OAEP"
    );
    return forge.util.encode64(decryptedBytes); // Convert back to Base64 format
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

/**
 * Encrypt a message using the recipient's public key
 * @param {string} message - The plain text message to encrypt
 * @param {string} publicKeyPem - The recipient's public key in PEM format
 * @returns {string} - The encrypted message (Base64 encoded)
 */
export function encryptMessage(message, publicKeyPem) {
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const encryptedBytes = publicKey.encrypt(
      forge.util.encodeUtf8(message),
      "RSA-OAEP"
    );
    return forge.util.encode64(encryptedBytes); // Convert to Base64 for storage
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
}

/**
 * Decrypt an encrypted message using the user's private key
 * @param {string} encryptedMessage - The encrypted message (Base64 encoded)
 * @param {string} privateKeyPem - The user's private key in PEM format
 * @param {string} senderPublicKeyPem - The sender's public key in PEM format (optional for verification)
 * @returns {string|null} - The decrypted message or null on failure
 */
export function decryptMessage(
  encryptedMessage,
  privateKeyPem,
) {
  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const encryptedBytes = forge.util.decode64(encryptedMessage);
    const decryptedMessage = privateKey.decrypt(encryptedBytes, "RSA-OAEP");

    return forge.util.decodeUtf8(decryptedMessage);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

/**
 * Encrypt a message using AES encryption.
 * @param {string} message - The plain text message.
 * @param {string} aesKey - The AES key in Base64 format.
 * @returns {string} - The encrypted message (Base64 encoded).
 */
export function encryptGroupMessage(message, aesKey) {
  try {
    const keyBytes = forge.util.decode64(aesKey); // Convert Base64 AES key to bytes
    const iv = forge.random.getBytesSync(16); // Generate a random IV
    const cipher = forge.cipher.createCipher("AES-CBC", keyBytes);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(message)));
    cipher.finish();

    // Store IV + encrypted text
    return forge.util.encode64(iv + cipher.output.getBytes());
  } catch (error) {
    console.error("AES Encryption error:", error);
    return null;
  }
}

/**
 * Decrypt a group message using AES decryption.
 * @param {string} encryptedMessage - The encrypted message (Base64 encoded).
 * @param {string} aesKey - The AES key in Base64 format.
 * @returns {string|null} - The decrypted message or null if decryption fails.
 */
export function decryptGroupMessage(encryptedMessage, aesKey) {
  try {
    const keyBytes = forge.util.decode64(aesKey); // Convert Base64 AES key to bytes
    const encryptedBytes = forge.util.decode64(encryptedMessage);

    const iv = encryptedBytes.slice(0, 16); // Extract IV
    const encrypted = encryptedBytes.slice(16); // Extract encrypted data

    const decipher = forge.cipher.createDecipher("AES-CBC", keyBytes);
    decipher.start({ iv });
    decipher.update(forge.util.createBuffer(encrypted));
    const success = decipher.finish();

    if (!success) throw new Error("Decryption failed!");

    return forge.util.decodeUtf8(decipher.output.getBytes());
  } catch (error) {
    console.error("AES Decryption error:", error);
    return null;
  }
}


