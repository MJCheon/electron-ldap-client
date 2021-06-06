import LdapClient from 'ldapjs-client'
import ErrorBox from './errorBox'


let client = ''
let baseDn = ''

const Ldapjs = {
  connect: async (server) => {
    if (client !== '') {
      await client.unbind().catch((error) => {
        ErrorBox.showError('LDAP Error', error.code + ' : ' + error.name)
      })
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


    await client.bind(server.rootDn, server.password).catch((error) => {
      ErrorBox.showError('LDAP Error', error.code + ' : ' + error.name)
    })

    const searchOptions = {
      scope: 'sub'
    }

    const searchEntries = await client.search(server.baseDn, searchOptions).catch((error) => {
      ErrorBox.showError('LDAP Error', error.code + ' : ' + error.name)
    })

    return { baseDn: baseDn, entries: searchEntries }  
  },
  search: async (dn = '', options = '') => {
    if (dn === '') dn = baseDn
    if (options === '') options = { scope: 'sub' }

    const searchEntries = await client.search(dn, options)

    return { baseDn: dn, entries: searchEntries }
  },
  modify: async (changeData) => {
    try{
      var id = changeData.id

      if (changeData.data) {
        changeData.data.forEach(async (item) => {
          const change = {
            operation: item.operation,
            modification: item.modifyData
          }
          await client.modify(id, change).catch((error) => {
              ErrorBox.showError('LDAP Error', error.code + ' : ' + error.name)
            }
          )
        })
      }
    } catch (e) {
      console.log('Error')
    }
  },
  unbind: async () => {
    await client.unbind().catch((error) => {
      ErrorBox.showError('LDAP Error', error.code + ' : ' + error.name)
    })
  }
}

export default Ldapjs
