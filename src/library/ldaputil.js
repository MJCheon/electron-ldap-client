import PasswordHasher from 'password-hasher'
import Crypto from 'crypto'
import CryptMD5 from 'cryptmd5'
import ErrorBox from './errorBox'

const LdapUtil = {
    getPassword: (password, pwdAlgo = '') => {
      var rfcHash = ''
      var salt = Crypto.randomBytes(16)
      pwdAlgo = pwdAlgo.toLowerCase()

      if (pwdAlgo !== '') {
        if (pwdAlgo === 'ssha' || pwdAlgo === 'smd5') {
          var hash = PasswordHasher.createHash(pwdAlgo, password, salt)
          rfcHash = PasswordHasher.formatRFC2307(hash)
        } else if (pwdAlgo === 'sha' || pwdAlgo === 'md5') {
          var hash = PasswordHasher.createHash(pwdAlgo, password)
          rfcHash = PasswordHasher.formatRFC2307(hash)
        } else if (pwdAlgo === 'crypt') {
          salt = Crypto.randomBytes(9)
          var hash = CryptMD5.cryptMD5(password)
          rfcHash = '{CRYPT}' + hash
        } else {
          const errorMsg = 'Check Password Algorithm\n' + 
          '- ssha\n' +
          '- smd5\n' +
          '- sha\n' +
          '- md5\n' +
          '- crypt (md5 crypt)'

          ErrorBox.showError('LDAP Password Error', errorMsg)
        }
      } 

      return rfcHash
    }
}

export default LdapUtil
