import Vue from 'vue';
import { CustomStore } from '../store/types';

declare module 'vue/types/vue' {
  interface Vue {
    $store: CustomStore;
    $eventHub: Vue;
  }
}

declare module 'vue/types/options' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ComponentOptions<V extends Vue> {
    store?: CustomStore;
  }
}
