import LdapClient from 'ldapjs-client'
import Assert from 'assert'

const Ldapjs = {
  connect: async (server) => {
    var url = 'ldap://' + server.ip + ':' + server.port
    if (server.ssl === 'ssl') {
      url = 'ldaps://' + server.ip + ':' + server.port
    }

    const client = new LdapClient({
      url: url,
      timeout: parseInt(server.connTimeout)
    })

    try{
      await client.bind(server.rootDn, server.password)

      const searchOptions = {
        scope: 'sub'
      }

      const searchEntries = await client.search(server.baseDn, searchOptions)

      return searchEntries
      
    } catch (e) {
      await client.destroy()
      Assert.ifError(e)
    } finally {
      await client.unbind()
    }
  }
}

export default Ldapjs