import {
  configureStore,
  StoreEnhancer,
  Middleware,
  Reducer,
  combineReducers,
} from '@reduxjs/toolkit';

import { RBACReducer, RBACState } from '../../components/RBACProvider';
import { reducer as cmAppReducer, ContentManagerAppState } from '../../content-manager/layout';
import { reducer as contentManagerReducers } from '../../content-manager/modules/reducers';
import { contentManagerApi } from '../../content-manager/services/api';
import { reducer as appReducer, AppState } from '../../reducer';
import { adminApi } from '../../services/api';

/**
 * @description Static reducers are ones we know, they live in the admin package.
 */
const staticReducers = {
  [adminApi.reducerPath]: adminApi.reducer,
  admin_app: appReducer,
  rbacProvider: RBACReducer,
  'content-manager_app': cmAppReducer,
  [contentManagerApi.reducerPath]: contentManagerApi.reducer,
  'content-manager': contentManagerReducers,
} as const;

const injectReducerStoreEnhancer: (appReducers: Record<string, Reducer>) => StoreEnhancer =
  (appReducers) =>
  (next) =>
  (...args) => {
    const store = next(...args);

    const asyncReducers: Record<string, Reducer> = {};

    return {
      ...store,
      asyncReducers,
      injectReducer: (key: string, asyncReducer: Reducer) => {
        asyncReducers[key] = asyncReducer;
        store.replaceReducer(
          // @ts-expect-error we dynamically add reducers which makes the types uncomfortable.
          combineReducers({
            ...appReducers,
            ...asyncReducers,
          })
        );
      },
    };
  };

type PreloadState = Partial<{
  admin_app: AppState;
}>;

/**
 * @description This is the main store configuration function, injected Reducers use our legacy app.addReducer API,
 * which we're trying to phase out. App Middlewares could potentially be improved...?
 */
const configureStoreImpl = (
  preloadedState: PreloadState = {},
  appMiddlewares: Array<() => Middleware> = [],
  injectedReducers: Record<string, Reducer> = {}
) => {
  const coreReducers = { ...staticReducers, ...injectedReducers } as const;

  const store = configureStore({
    preloadedState: {
      admin_app: preloadedState.admin_app,
    },
    reducer: coreReducers,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) => [
      ...getDefaultMiddleware(),
      adminApi.middleware,
      contentManagerApi.middleware,
      ...appMiddlewares.map((m) => m()),
    ],
    enhancers: [injectReducerStoreEnhancer(coreReducers)],
  });

  return store;
};

type Store = ReturnType<typeof configureStoreImpl> & {
  asyncReducers: Record<string, Reducer>;
  injectReducer: (key: string, asyncReducer: Reducer) => void;
};

type RootState = ReturnType<Store['getState']>;

export { configureStoreImpl as configureStore };
export type { RootState, AppState, RBACState, Store, PreloadState, ContentManagerAppState };
