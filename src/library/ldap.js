import LdapClient from 'ldapjs-client'
import Assert from 'assert'

let client = ''

const Ldapjs = {
  connect: async (server) => {
    if (client !== '') {
      client.unbind()
    }

    var url = 'ldap://' + server.ip + ':' + server.port
    
    if (server.ssl === 'ssl') {
      url = 'ldaps://' + server.ip + ':' + server.port
    }

    client = new LdapClient({
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
    }
  },
  modify: async (saveData) => {
    try {
      const id = saveData.id

      saveData.data.forEach(async (item) => {
        const change = {
          operation: item.operation,
          modification: item.modifyData
        }

        console.log(id)
        console.log(change)
        // await client.modify(id, change)
      })
    } catch (e) {
      Assert.ifError(e)
    }
  }
}

export default Ldapjs
