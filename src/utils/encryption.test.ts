import { describe, it, expect, beforeAll } from 'vitest'
import {
  generateKey,
  exportKey,
  importKey,
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
} from './encryption'
import { CURRENT_SCHEMA_VERSION } from '../types/schema'

describe('encryption', () => {
  let testKey: CryptoKey

  beforeAll(async () => {
    testKey = await generateKey()
  })

  describe('generateKey', () => {
    it('should generate a valid CryptoKey', async () => {
      const key = await generateKey()
      expect(key).toBeDefined()
      expect(key.type).toBe('secret')
      expect(key.algorithm.name).toBe('AES-GCM')
    })

    it('should generate unique keys each time', async () => {
      const key1 = await generateKey()
      const key2 = await generateKey()
      const exported1 = await exportKey(key1)
      const exported2 = await exportKey(key2)
      expect(exported1).not.toBe(exported2)
    })
  })

  describe('exportKey / importKey', () => {
    it('should export key to base64 string', async () => {
      const exported = await exportKey(testKey)
      expect(typeof exported).toBe('string')
      expect(exported.length).toBeGreaterThan(0)
    })

    it('should import key from base64 string', async () => {
      const exported = await exportKey(testKey)
      const imported = await importKey(exported)
      expect(imported).toBeDefined()
      expect(imported.type).toBe('secret')
    })

    it('should round-trip key export/import correctly', async () => {
      const original = await generateKey()
      const exported = await exportKey(original)
      const imported = await importKey(exported)

      // Verify by encrypting/decrypting with both keys
      const testData = 'test data'
      const encrypted = await encrypt(testData, original)
      const decrypted = await decrypt(encrypted, imported)
      expect(decrypted).toBe(testData)
    })
  })

  describe('encrypt / decrypt', () => {
    it('should encrypt and decrypt a string', async () => {
      const plaintext = 'Hello, World!'
      const encrypted = await encrypt(plaintext, testKey)
      const decrypted = await decrypt(encrypted, testKey)
      expect(decrypted).toBe(plaintext)
    })

    it('should include schema version in encrypted data', async () => {
      const encrypted = await encrypt('test', testKey)
      expect(encrypted.version).toBe(CURRENT_SCHEMA_VERSION)
    })

    it('should generate unique IV for each encryption', async () => {
      const plaintext = 'same text'
      const encrypted1 = await encrypt(plaintext, testKey)
      const encrypted2 = await encrypt(plaintext, testKey)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
    })

    it('should handle empty string', async () => {
      const plaintext = ''
      const encrypted = await encrypt(plaintext, testKey)
      const decrypted = await decrypt(encrypted, testKey)
      expect(decrypted).toBe(plaintext)
    })

    it('should handle unicode characters', async () => {
      const plaintext = '你好世界 🌍 مرحبا'
      const encrypted = await encrypt(plaintext, testKey)
      const decrypted = await decrypt(encrypted, testKey)
      expect(decrypted).toBe(plaintext)
    })

    it('should handle long strings', async () => {
      const plaintext = 'x'.repeat(100000)
      const encrypted = await encrypt(plaintext, testKey)
      const decrypted = await decrypt(encrypted, testKey)
      expect(decrypted).toBe(plaintext)
    })

    it('should fail with wrong key', async () => {
      const plaintext = 'secret data'
      const encrypted = await encrypt(plaintext, testKey)
      const wrongKey = await generateKey()

      await expect(decrypt(encrypted, wrongKey)).rejects.toThrow()
    })

    it('should fail with tampered data', async () => {
      const plaintext = 'secret data'
      const encrypted = await encrypt(plaintext, testKey)

      // Tamper with the encrypted data
      const tamperedData = {
        ...encrypted,
        data: encrypted.data.slice(0, -4) + 'XXXX',
      }

      await expect(decrypt(tamperedData, testKey)).rejects.toThrow()
    })
  })

  describe('encryptObject / decryptObject', () => {
    it('should encrypt and decrypt an object', async () => {
      const obj = { name: 'John', age: 30, nested: { foo: 'bar' } }
      const encrypted = await encryptObject(obj, testKey)
      const decrypted = await decryptObject(encrypted, testKey)
      expect(decrypted).toEqual(obj)
    })

    it('should handle arrays', async () => {
      const arr = [1, 2, 3, { a: 'b' }]
      const encrypted = await encryptObject(arr, testKey)
      const decrypted = await decryptObject(encrypted, testKey)
      expect(decrypted).toEqual(arr)
    })

    it('should handle complex profile-like object', async () => {
      const profile = {
        schemaVersion: '1.0',
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
        },
        workExperience: [
          { id: '1', jobTitle: 'Developer', company: 'Acme Inc' },
        ],
      }
      const encrypted = await encryptObject(profile, testKey)
      const decrypted = await decryptObject(encrypted, testKey)
      expect(decrypted).toEqual(profile)
    })
  })
})
