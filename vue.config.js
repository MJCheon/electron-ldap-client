module.exports = {
  pluginOptions: {
    electronBuilder: {
        nodeIntegration: true
    }
  },
  transpileDependencies: [
    'vuetify',
    'vuex-persist'
  ]
}
