import LdapClient from 'ldapjs-client'
import Assert from 'assert'

let client = ''
let baseDn = ''

const Ldapjs = {
  connect: async (server) => {
    if (client !== '') {
      client.unbind()
    }
    baseDn = server.baseDn

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

      return { baseDn: baseDn, entries: searchEntries }
      
    } catch (e) {
      await client.destroy()
      Assert.ifError(e)
    }
  },
  search: async (dn = '', options = '') => {
    if (dn === '') dn = baseDn
    if (options === '') options = { scope: 'sub' }

    const searchEntries = await client.search(dn, options)

    return { baseDn: dn, entries: searchEntries }
  },
  modify: async (saveData) => {
    try {
      const id = saveData.id

      saveData.data.forEach(async (item) => {
        const change = {
          operation: item.operation,
          modification: item.modifyData
        }
        await client.modify(id, change)
      })
    } catch (e) {
      Assert.ifError(e)
    }
  }
}

export default Ldapjs
