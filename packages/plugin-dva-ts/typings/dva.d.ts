/*
 * @Author: yanxlg
 * @Date: 2023-05-24 13:38:54
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-24 15:58:20
 * @Description: umi 中dva 类型支持
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
declare module "dva" {
  type AnyAction = import("redux").AnyAction;
  type Dispatch<T> = import("redux").Dispatch;
  type History = import("history").History;
  type Action = import("redux").Action;

  type Reducer<S = any, A extends Action = AnyAction> = (
    state: S,
    action: A
  ) => S;

  interface ReducersMapObject<T> {
    [key: string]: Reducer<T>;
  }
  interface ReducerEnhancer<T> {
    (reducer: Reducer<T>): void;
  }

  type ReducersMapObjectWithEnhancer<T> = [
    ReducersMapObject<T>,
    ReducerEnhancer<T>
  ];

  interface SubscriptionAPI {
    history: History;
    dispatch: Dispatch<any>;
  }

  type Subscription = (api: SubscriptionAPI, done: Function) => void;

  interface SubscriptionsMapObject {
    [key: string]: Subscription;
  }

  interface EffectsCommandMap {
    put: <A extends AnyAction>(action: A) => any;
    call: Function;
    select: Function;
    take: Function;
    cancel: Function;
    [key: string]: any;
  }

  type Effect = (action: AnyAction, effects: EffectsCommandMap) => void;

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

  type Models = typeof import("@@/plugin-dva-ts/models").models;

  type RegisterModels = {
    [P in keyof Models]: Models[P]["state"];
  };

  export function connect<P>(
    mapStateToProps?: (models: RegisterModels) => Partial<P>,
    mapDispatchToProps?: Function,
    mergeProps?: Function,
    options?: Object
  ): (
    ComponentType: (props: P & { dispatch: Dispatch<any> }) => React.JSX.Element
  ) => React.ComponentType<P>;
}
