/*
 * @Author: yanxlg
 * @Date: 2023-05-24 13:38:54
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-24 13:39:09
 * @Description: umi 中dva 类型支持
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
declare module "dva" {
  interface ReducersMapObject<T> {
    [key: string]: import("redux").Reducer<T>;
  }
  interface ReducerEnhancer<T> {
    (reducer: import("redux").Reducer<T>): void;
  }

  type ReducersMapObjectWithEnhancer<T> = [
    ReducersMapObject<T>,
    ReducerEnhancer<T>
  ];

  interface SubscriptionAPI {
    history: import("history").History;
    dispatch: import("redux").Dispatch<any>;
  }

  type Subscription = (api: SubscriptionAPI, done: Function) => void;

  interface SubscriptionsMapObject {
    [key: string]: Subscription;
  }

  interface EffectsCommandMap {
    put: <A extends import("redux").AnyAction>(action: A) => any;
    call: Function;
    select: Function;
    take: Function;
    cancel: Function;
    [key: string]: any;
  }

  type Effect = (
    action: import("redux").AnyAction,
    effects: EffectsCommandMap
  ) => void;

  type EffectType = "takeEvery" | "takeLatest" | "watcher" | "throttle";
  type EffectWithType = [Effect, { type: EffectType }];

  interface EffectsMapObject {
    [key: string]: Effect | EffectWithType;
  }

  export interface Model<T> {
    namespace?: string;
    state?: T;
    reducers?: ReducersMapObject<T> | ReducersMapObjectWithEnhancer<T>;
    effects?: EffectsMapObject;
    subscriptions?: SubscriptionsMapObject;
  }
}
