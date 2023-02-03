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
  let regex: RegExp = /\{|\}/g
  let content: string = JSON.stringify(ldapError.data, null, ' ').replace(regex, '') + '\n\n' + ldapError.msg
  
  dialog.showErrorBox(title, content)
}

export function makeErrorData (type: string, values: string|string[]|Buffer[]): ErrorData {
  let errData: ErrorData = {
    type: type,
    values: values
  }

  return errData
}