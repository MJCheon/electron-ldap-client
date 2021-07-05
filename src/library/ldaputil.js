import Crypto from 'crypto'
import CryptMD5 from 'cryptmd5'
import ErrorBox from './errorBox'

const LdapUtil = {
  getEncryptPassword: (password, pwdAlgo = '') => {
    var encryptPwd = ''
    pwdAlgo = pwdAlgo.toLowerCase()

    encryptPwd = createHash(pwdAlgo, password, salt)
    
    if (encryptPwd === -1) {
      const errorMsg = 'Possible Password Algorithm\n' + 
        '- ssha\n' +
        '- smd5\n' +
        '- sha\n' +
        '- md5\n' +
        '- crypt (md5 crypt)'

        ErrorBox.showError('Unavailable Algorithm', errorMsg)
        return ''
    } 

    return encryptPwd
  },
  createHash: (pwdAlgo, pwd, salt) => {
    var hash = ''
    var salt = ''
    var encodingHash = ''
    var rfcHash = ''

    switch (pwdAlgo) {
      case 'ssha':
      case 'smd5':
        salt = Crypto.randomBytes(16)
        hash = Crypto.createHash(pwdAlgo).update(pwd).update(salt).digest()
        encodingHash = Buffer.concat([hash, salt]).toString('base64')
        rfcHash = '{' + pwdAlgo.toUpperCase() + '}' + encodingHash
        break;
      case 'sha':
      case 'smd5':
        salt = Crypto.randomBytes(0)
        hash = Crypto.createHash(pwdAlgo).update(pwd).update(salt).digest()
        encodingHash = Buffer.concat([hash, salt]).toString('base64')
        rfcHash = '{' + pwdAlogo.toUpperCase() + '}' + encodingHash
        break;
      case 'crypt':
        salt = Crypto.randomBytes(9)
        encodingHash = CryptMD5.cryptMD5(password)
        rfcHash = '{CRYPT}' + encodingHash
        break;
      default:
        return -1
    }

    return rfcHash
  }
}

export default LdapUtil
