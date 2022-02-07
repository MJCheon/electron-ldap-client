import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  Cipher,
  Decipher
} from 'crypto'

export function getIv (length = 16): Buffer {
  const ivBuffer: Buffer = randomBytes(length)
  return ivBuffer
}

export function encrypt (text: string, key: Buffer, iv: Buffer): string {
  const cipher: Cipher = createCipheriv('aes-128-cbc', key, iv)
  let result: string = cipher.update(text, 'utf8', 'base64' || 'binary')
  result += cipher.final('base64' || 'binary')
  return result
}

export function decrypt (text: string, key: Buffer, iv: Buffer): string {
  const decipher: Decipher = createDecipheriv('aes-128-cbc', key, iv)
  let result: Buffer = decipher.update(text, 'base64' || 'binary')
  result = Buffer.concat([result, decipher.final()])
  return result.toString()
}
