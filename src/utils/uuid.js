import { v4 as uuidv4 } from 'uuid'
import { machineIdSync } from 'node-machine-id'

const Uuid = {
  getServerUuid: () => {
    return uuidv4()
  },
  getDeviceUuid: () => {
    return machineIdSync({ original: true })
  }
}

export default Uuid
