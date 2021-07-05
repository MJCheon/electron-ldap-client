import Crypto from 'crypto'
import CryptMD5 from 'cryptmd5'
import ErrorBox from './errorBox'

const LdapUtil = {
  getEncryptPassword: (password, pwdAlgo = '') => {
    var encryptPwd = ''
    pwdAlgo = pwdAlgo.toLowerCase()

    encryptPwd = LdapUtil.createHash(pwdAlgo, password)
    
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
  createHash: (pwdAlgo, pwd) => {
    var hash = ''
    var salt = ''
    var encodingHash = ''
    var rfcHash = ''

    switch (pwdAlgo) {
      case 'ssha':
        salt = Crypto.randomBytes(16)
        hash = Crypto.createHash('sha1').update(pwd).update(salt).digest()
        encodingHash = Buffer.concat([hash, salt]).toString('base64')
        break;
      case 'smd5':
        salt = Crypto.randomBytes(16)
        hash = Crypto.createHash('md5').update(pwd).update(salt).digest()
        encodingHash = Buffer.concat([hash, salt]).toString('base64')
        break;
      case 'sha':
      case 'md5':
        salt = Crypto.randomBytes(0)
        hash = Crypto.createHash(pwdAlgo).update(pwd).update(salt).digest()
        encodingHash = Buffer.concat([hash, salt]).toString('base64')
        break;
      case 'crypt':
        salt = Crypto.randomBytes(9)
        encodingHash = CryptMD5.cryptMD5(pwd)
        break;
      default:
        return -1
    }

    rfcHash = '{' + pwdAlgo.toUpperCase() + '}' + encodingHash
    return rfcHash
  }
}

export default LdapUtil
