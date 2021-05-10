import { v4 as uuidv4, parse } from 'uuid'

const Uuid = {
  getServerUuid: () => {
    return uuidv4()
  },
  getParsedUuid: (uuid) => {
    return parse(uuid)
  }
}

export default Uuid
