import { useDebugValue, useEffect, useState } from "react";

export type InitialGlobalState = Record<(string | number) & symbol, unknown>;

export type GlobalStateStore<T extends InitialGlobalState> = {
  getInitialState: () => T;
  getState: () => T;
  setState: (action: (prev: T) => T) => void;
  subscribe: (callback: () => void) => () => void;
};

// createGlobalStateStore 함수로 전역 상태 관리 객체를 생성하고,
// useGlobalStateStore 훅을 사용하여 전역 상태를 구독 및 업데이트

export const createGlobalStateStore = <T extends InitialGlobalState>(initialState: T): GlobalStateStore<T> => {
  let state = initialState;
  const callbacks = new Set<() => void>();

  const getInitialState = () => initialState;
  const getState = () => state;

  const setState = (nextState: (prev: T) => T) => {
    if (typeof nextState === "function") {
      state = (nextState as (prev: T) => T)(state);
    } else {
      state = nextState;
    }

    callbacks.forEach((callback) => callback());
    //상태가 변경되면 등록된 모든 콜백을 실행. 상태를 구독하는 컴포넌트들이 상태 변화에 반응하도록
  };

  const subscribe = (callback: () => void) => {
    callbacks.add(callback);
    return () => callbacks.delete(callback);
  };

  return { getInitialState, getState, setState, subscribe };
};

export const useGlobalStateStore = <T extends InitialGlobalState>({
  store,
  selector,
}: {
  store: GlobalStateStore<T>;
  selector: (state: T) => T[keyof T];
}): [T[keyof T], GlobalStateStore<T>["setState"]] => {
  const [state, setState] = useState(() => selector(store.getState()));

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(selector(store.getState())));
    setState(selector(store.getState()));
    return () => unsubscribe();
  }, []);

  useDebugValue(state);
  return [state, store.setState];
};
