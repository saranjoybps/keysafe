import "server-only"
import crypto from "node:crypto"

const ALGORITHM = "aes-256-gcm"
const KEY_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

export function generateKey(): Buffer {
  return crypto.randomBytes(KEY_LENGTH)
}

export function encryptPassword(
  plaintext: string,
  key: Buffer
): { ciphertext: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, "utf8", "hex")
  encrypted += cipher.final("hex")
  const authTag = cipher.getAuthTag().toString("hex")

  return {
    ciphertext: encrypted,
    iv: iv.toString("hex"),
    authTag,
  }
}

export function decryptPassword(
  ciphertext: string,
  iv: string,
  authTag: string,
  key: Buffer
): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex")
  )
  decipher.setAuthTag(Buffer.from(authTag, "hex"))

  let decrypted = decipher.update(ciphertext, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

export function getTenantEncryptionKey(encryptedKey: string): Buffer {
  const masterSecret = process.env.SESSION_SECRET
  if (!masterSecret) throw new Error("SESSION_SECRET not set")
  const masterKey = crypto.createHash("sha256").update(masterSecret).digest()
  const encrypted = encryptedKey.slice(IV_LENGTH * 2, -TAG_LENGTH * 2)
  const iv = Buffer.from(encryptedKey.slice(0, IV_LENGTH * 2), "hex")
  const authTag = Buffer.from(encryptedKey.slice(-TAG_LENGTH * 2), "hex")
  const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return Buffer.from(decrypted, "hex")
}

export function encryptTenantKey(plainKey: Buffer): string {
  const masterSecret = process.env.SESSION_SECRET
  if (!masterSecret) throw new Error("SESSION_SECRET not set")
  const masterKey = crypto.createHash("sha256").update(masterSecret).digest()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv)
  let encrypted = cipher.update(plainKey.toString("hex"), "utf8", "hex")
  encrypted += cipher.final("hex")
  const authTag = cipher.getAuthTag().toString("hex")
  return iv.toString("hex") + encrypted + authTag
}
