<template>
  <v-treeview
    v-model='tree'
    :open='initiallyOpen'
    :items='items'
    activatable
    item-key='name'
    open-on-click
  >
    <template v-slot:prepend='{ item, open }'>
      <v-icon v-if='!item.file'>
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
      <v-icon v-else>
        {{ files[item.file] }}
      </v-icon>
    </template>
  </v-treeview>
</template>

<script>
export default {
  data: () => ({
    initiallyOpen: [
      'People',
      'Netgroup',
      'Host',
      'Group'
    ],
    file: [],
    tree: [],
    items: [
      {
        name: 'People',
        children: [
          {
            name: 'Infra',
            children: [
              {
                name: 'user1'
              }
            ]
          }
        ]
      },
      {
        name: 'Netgroup',
        children: [
          {
            name: 'se'
          },
          {
            name: 'dev'
          }
        ]
      },
      {
        name: 'Host'
      },
      {
        name: 'Group',
        children: [
          {
            name: 'guser'
          },
          {
            name: 'gother'
          }
        ]
      }
    ]
  })
}
</script>
