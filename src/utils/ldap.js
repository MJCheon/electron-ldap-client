import Store from '../store/index'
import Ldap from 'ldapjs'

const Ldapjs = {
  connect: (serverId) => {
    const promisify = require('./promisify')
    const server = Store.getters.getServer(serverId)
    var url = 'ldap://' + server.ip + ':' + server.port
    if (server.ssl === 'ssl') {
      url = 'ldaps://' + server.ip + ':' + server.port
    }

    const client = Ldap.createClient({
      url: url,
      timeout: parseInt(server.connTimeout)
    })

    const [bind, search] = promisify(client, 'bind', 'search')

    const data = bind(server.rootDn, 'password').then(() => {
      const opts = {
        scope: 'sub',
        attributes: ['dn', 'sn', 'cn']
      }
      return search(server.baseDn, opts)
    })

    console.log(data)
  }
}

export default Ldapjs
