import { CommitOptions, DispatchOptions, Store } from 'vuex';
import { ServerListState } from './ServerListStore/state';
import { ServerListMutations } from './ServerListStore/mutations';
import { ServerListGetters } from './ServerListStore/getters';
import { ServerListActions } from './ServerListStore/actions';

export type RootState = {
  ServerList: ServerListState;
}

export type MergedMutations = ServerListMutations;
export type MergedGetters = ServerListGetters;
export type MergedActions = ServerListActions;

type CustomMutations = {
  commit<K extends keyof MergedMutations, P extends Parameters<MergedMutations[K]>[1]>(
    key: K,
    payload?: P,
    options?: CommitOptions,
  ): ReturnType<MergedMutations[K]>;
};

type CustomActions = {
  dispatch<K extends keyof MergedActions>(
    key: K,
    payload?: Parameters<MergedActions[K]>[1],
    options?: DispatchOptions,
  ): ReturnType<MergedActions[K]>;
};

type CustomGetters = {
  getters: {
    [K in keyof MergedGetters]: ReturnType<MergedGetters[K]>;
  };
};

export type CustomStore = Omit<Store<RootState>, 'commit' | 'dispatch' | 'getters'> &
  CustomMutations &
  CustomActions &
  CustomGetters;
