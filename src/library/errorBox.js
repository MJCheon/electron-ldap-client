import { dialog } from 'electron'

const ErrorBox = {
  showError: (title, message) => {
    const option = {
      type: 'error',
      title: title,
      message: message
    }

    dialog.showMessageBox(option)
  }
}

export default ErrorBox
