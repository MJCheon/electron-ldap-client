const { dependencies } = require('./package.json')



module.exports = {
  configureWebpack: {
    externals: {
      'socket.io-client': 'commonjs socket.io-client'
    }
  },
  transpileDependencies: [
    'vuetify'
  ]
}
