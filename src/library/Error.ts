import { dialog } from 'electron'

export type LdapError = {
  msg: string,
  data: ErrorData
}

export type ErrorData = {
  type: string,
  values: string|string[]|Buffer[]
}

export function showError (title: string, ldapError: LdapError) {
  let message: string = JSON.stringify(ldapError.data, null, 2) + '\n\n' + ldapError.msg
  
  const option = {
    type: 'error',
    title: title,
    textWidth: 2,
    message: message
  }
  
  dialog.showMessageBox(option)
}

export function makeErrorData (type: string, values: string|string[]|Buffer[]): ErrorData {
  let errData: ErrorData = {
    type: type,
    values: values
  }

  return errData
}