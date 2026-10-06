import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes is standard for GCM
const AUTH_TAG_LENGTH = 16;

const getKey = () => {
  const key = process.env.MESSAGE_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("WARNING: MESSAGE_ENCRYPTION_KEY is missing or invalid. Falling back to plaintext.");
      return null;
    }
    throw new Error("MESSAGE_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return Buffer.from(key, "hex");
};

export const encrypt = (plaintext) => {
  if (!plaintext) return plaintext;
  
  const key = getKey();
  if (!key) return plaintext; // Fallback for dev mode

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Format: iv:authTag:ciphertext
  return `${iv.toString("hex")}:${authTag}:${ciphertext}`;
};

export const decrypt = (ciphertextString) => {
  if (!ciphertextString || typeof ciphertextString !== "string") return ciphertextString;
  
  // If it doesn't look like an encrypted payload, return as-is
  const parts = ciphertextString.split(":");
  if (parts.length !== 3) return ciphertextString;

  const key = getKey();
  if (!key) return ciphertextString; // Fallback for dev mode

  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let plaintext = decipher.update(encryptedHex, "hex", "utf8");
    plaintext += decipher.final("utf8");
    
    return plaintext;
  } catch (error) {
    console.error("Failed to decrypt message:", error.message);
    return "[Encrypted Message]";
  }
};
