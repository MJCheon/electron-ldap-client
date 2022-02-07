import { randomBytes, createHash } from 'crypto'
import { showError } from './common'

function saltedMD5 (pw: string, salt: Buffer) {
  const magic = '$1$'
  let fin: string
  const sp = salt || generateSalt(8)

  const ctx = createHash('md5')

  // The password first, since that is what is most unknown
  // Then our magic string
  // Then the raw salt
  ctx.update(pw + magic + sp)

  // Then just as many characters of the MD5(pw,sp,pw)
  const ctx1 = createHash('md5')
  ctx1.update(pw)
  ctx1.update(sp)
  ctx1.update(pw)
  fin = ctx1.digest('binary')

  for (let i = 0; i < pw.length; i++) {
    ctx.update(fin.substr(i % 16, 1), 'binary')
  }

  // Then something really weird...

  // Also really broken, as far as I can tell.  -m
  // Agreed ;) -dd

  for (let i = pw.length; i; i >>= 1) {
    ctx.update(i & 1 ? '\x00' : pw[0])
  }

  fin = ctx.digest('binary')

  // and now, just to make sure things don't run too fast
  for (let i = 0; i < 1000; i++) {
    const ctx1 = createHash('md5')

    if (i & 1) {
      ctx1.update(pw)
    } else {
      ctx1.update(fin, 'binary')
    }

    if (i % 3) {
      ctx1.update(sp)
    }

    if (i % 7) {
      ctx1.update(pw)
    }

    if (i & 1) {
      ctx1.update(fin, 'binary')
    } else {
      ctx1.update(pw)
    }

    fin = ctx1.digest('binary')
  }

  return magic + sp + '$' + to64(fin)
}

function to64 (data: string): string {
  // This is the bit that uses to64() in the original code.

  const itoa64 = [
    '.',
    '/',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ]

  let rearranged = ''

  const opt: number[][] = [
    [0, 6, 12],
    [1, 7, 13],
    [2, 8, 14],
    [3, 9, 15],
    [4, 10, 5]
  ]

  for (const p in opt) {
    let l =
      (data.charCodeAt(opt[p][0]) << 16) |
      (data.charCodeAt(opt[p][1]) << 8) |
      data.charCodeAt(opt[p][2])

    for (let i = 0; i < 4; i++) {
      rearranged += itoa64[l & 0x3f]
      l >>= 6
    }
  }

  let l = data.charCodeAt(11)
  for (let i = 0; i < 2; i++) {
    rearranged += itoa64[l & 0x3f]
    l >>= 6
  }

  return rearranged
}

function generateSalt (len: number): string {
  const set =
    '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ'
  const setLen = set.length

  let salt = ''

  for (let i = 0; i < len; i++) {
    const p: number = Math.floor(Math.random() * setLen)
    salt += set[p]
  }

  return salt
}

function createHashedPwd (pwdAlgo: string, pwd: string): string {
  let hash: Buffer
  let salt: Buffer
  let encodingHash = ''
  let rfcHash = ''

  switch (pwdAlgo) {
    case 'ssha':
      salt = randomBytes(16)
      hash = createHash('sha1').update(pwd).update(salt).digest()
      encodingHash = Buffer.concat([hash, salt]).toString('base64')
      break
    case 'smd5':
      salt = randomBytes(16)
      hash = createHash('md5').update(pwd).update(salt).digest()
      encodingHash = Buffer.concat([hash, salt]).toString('base64')
      break
    case 'sha':
    case 'md5':
      salt = randomBytes(0)
      hash = createHash(pwdAlgo).update(pwd).update(salt).digest()
      encodingHash = Buffer.concat([hash, salt]).toString('base64')
      break
    case 'crypt':
      salt = randomBytes(9)
      encodingHash = saltedMD5(pwd, salt)
      break
    default:
      return ''
  }

  rfcHash = '{' + pwdAlgo.toUpperCase() + '}' + encodingHash
  return rfcHash
}

export function getEncryptPassword (password: string, pwdAlgo: string): string {
  let encryptPwd = ''
  pwdAlgo = pwdAlgo.toLowerCase()

  encryptPwd = createHashedPwd(pwdAlgo, password)

  if (encryptPwd === '') {
    const errorMsg =
      'Possible Password Algorithm\n' +
      '- ssha\n' +
      '- smd5\n' +
      '- sha\n' +
      '- md5\n' +
      '- crypt (md5 crypt)'

    showError('Unavailable Algorithm', errorMsg)
    return ''
  }

  return encryptPwd
}
