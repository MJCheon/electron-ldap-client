import Ldap from 'ldapjs'
import Assert from 'assert'
import { ipcMain } from 'electron'

const Ldapjs = {
  connect: (event, server) => {
    var url = 'ldap://' + server.ip + ':' + server.port
    if (server.ssl === 'ssl') {
      url = 'ldaps://' + server.ip + ':' + server.port
    }

    const client = Ldap.createClient({
      url: url,
      connectTimeout: parseInt(server.connTimeout)
    })

    try{
      client.bind(server.rootDn, server.password, (err) => {
        throw err
      })

      const searchOptions = {
        scope: 'sub'
      }

      client.search(server.baseDn, searchOptions, (err, res) => {
        
        res.on('searchEntry', (entry) => {
          event.reply('sendBindResponse', JSON.parse(JSON.stringify(entry.object)))
        })

        res.on('searchReference', (referral) => {
          console.log('referral: ' + referral.uris.join())
        })

        res.on('end', (result) => {
          console.log('status: ' + result.status)
        })
      })

    } catch (e) {
      client.unbind()
      Assert.ifError(e)
    } finally {
      client.unbind()
    }
  },
}

export default Ldapjs
