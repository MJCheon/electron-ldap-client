const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules/vuex/types', 'vue.d.ts');

fs.access(filePath, fs.constants.F_OK, (error) => {
  if (error) return;

  fs.unlink(filePath, (error) => {
    if (error) return;
    console.log('[deleted] vuex/types/vue.d.ts\n');
  });
});