import { useDebugValue, useEffect, useState } from "react";

export type InitialGlobalState = Record<(string | number) & symbol, unknown>;

export type GlobalStateStore<T extends InitialGlobalState> = {
  getInitialState: () => T;
  getState: () => T;
  setState: (action: (prev: T) => T) => void;
  subscribe: (callback: () => void) => () => void;
};

export const createGlobalStateStore = <T extends InitialGlobalState>(
  initialState: T
): GlobalStateStore<T> => {
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
    const unsubscribe = store.subscribe(() =>
      setState(selector(store.getState()))
    );
    setState(selector(store.getState()));
    return () => unsubscribe();
  }, []);

  useDebugValue(state);
  return [state, store.setState];
};
