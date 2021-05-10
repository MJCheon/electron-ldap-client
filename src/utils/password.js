import Crypto from 'crypto'

const Password = {
  gi: (length = 16) => {
    var ivBuffer = cr.randomBytes(length);
    return ivBuffer;
  },
  en: (text, iv) => {
    var cipher = cr.createCipheriv("aes-128-cbc", store.getters['MyInfo/getAppNo'], iv);
    var result = cipher.update(text, "utf8", "base64" || "binary");
    result += cipher.final("base64" || "binary");
    return result;
  },
  de: (text, iv) => {
    var decipher = cr.createDecipheriv("aes-128-cbc", store.getters['MyInfo/getAppNo'], iv);
    var result = decipher.update(text, "base64" || "binary");
    result += decipher.final();
    return result;
  },
  he: (ep, key) => {
    var cipher = cr.createCipher('aes-128-ecb', key);
    return cipher.update(ep,'utf8','hex') + cipher.final('hex');
  }
}

export default Password
