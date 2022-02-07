import { Module } from 'vuex';
import { RootState } from '../types';
import { ServerListState, serverListState } from './state';
import { serverListMutations } from './mutations';
import { serverListActions } from './actions';
import { serverListGetters } from './getters';

const serverListModules: Module<ServerListState, RootState> = {
    state: serverListState,
    mutations: serverListMutations,
    actions: serverListActions,
    getters: serverListGetters,
};

export default serverListModules;
