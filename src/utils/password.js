const Password = {
  encrypt: (data, key) => {
    return Crypto.AES.encrypt(data, key).toString()
  },
  decrypt: (data, key) => {
    return Crypto.AES.decrypt(data, key).toString(Crypto.enc.Utf8)
  }
}

export default Password
