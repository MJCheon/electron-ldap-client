import Crypto from 'crypto'

const Password = {
  getIv: (length = 16) => {
    var ivBuffer = Crypto.randomBytes(length)
    return ivBuffer
  },
  encrypt: (text, key, iv) => {
    var cipher = Crypto.createCipheriv('aes-128-cbc', key, iv)
    var result = cipher.update(text, 'utf8', 'base64' || 'binary')
    result += cipher.final('base64' || 'binary')
    return result
  },
  decrypt: (text, key, iv) => {
    var decipher = Crypto.createDecipheriv('aes-128-cbc', key, iv)
    var result = decipher.update(text, 'base64' || 'binary')
    result += decipher.final()
    return result
  }
}

export default Password
