// AES-256-GCM encryption utilities using Web Crypto API

import { CURRENT_SCHEMA_VERSION, type EncryptedData } from '../types/schema'

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits recommended for GCM

// Generate a new encryption key
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true, // extractable - needed to export/import
    ['encrypt', 'decrypt']
  )
}

// Export key to base64 string for storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key)
  return arrayBufferToBase64(exported)
}

// Import key from base64 string
export async function importKey(keyData: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyData)
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

// Encrypt data
export async function encrypt(
  data: string,
  key: CryptoKey
): Promise<EncryptedData> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encodedData
  )

  return {
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(encryptedBuffer),
    version: CURRENT_SCHEMA_VERSION,
  }
}

// Decrypt data
export async function decrypt(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<string> {
  const iv = base64ToArrayBuffer(encryptedData.iv)
  const data = base64ToArrayBuffer(encryptedData.data)

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  )

  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}

// Encrypt an object (serializes to JSON first)
export async function encryptObject<T>(
  obj: T,
  key: CryptoKey
): Promise<EncryptedData> {
  const jsonString = JSON.stringify(obj)
  return encrypt(jsonString, key)
}

// Decrypt to an object (parses JSON)
export async function decryptObject<T>(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<T> {
  const jsonString = await decrypt(encryptedData, key)
  return JSON.parse(jsonString) as T
}

// Helper: ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes =
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Helper: Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
