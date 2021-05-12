import Store from '../store/index'
import Ldap from 'ldapjs'

const Ldapjs = {
  connect: (serverId) => {
    const server = Store.getters.getServer(serverId)
    var url = 'ldap://' + server.ip + ':' + server.port
    if (server.ssl === 'ssl') {
      url = 'ldaps://' + server.ip + ':' + server.port
    }

    const client = Ldap.createClient({
      url: url
    })
    console.log(client)
  }
}

export default Ldapjs
