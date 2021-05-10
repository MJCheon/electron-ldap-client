import { v4 as uuidv4, parse } from 'uuid'

const Uuid = {
  getServerUuid: () => {
    return uuidv4()
  },
  uuidParse: (uuid) => {
    return parse(uuid)
  }
}

export default Uuid
