import { useEffect, useState } from "react";

type InitialGlobalState = Record<(string | number) & symbol, unknown>;

export type GlobalStateStore<T extends InitialGlobalState> = {
  getState: () => T;
  setState: (action: T | ((prev: T) => T)) => void;
  subscribe: (callback: () => void) => () => void;
};

export const createGlobalStateStore = <T extends InitialGlobalState>(
  initialState: T
): GlobalStateStore<T> => {
  let state = initialState;
  const callbacks = new Set<() => void>();

  const getState = () => state;

  const setState = (nextState: T | ((prev: T) => T)) => {
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

  return { getState, setState, subscribe };
};

export const useGlobalStateStore = <T extends InitialGlobalState>({
  store,
  selector,
}: {
  store: GlobalStateStore<T>;
  selector: (state: T) => Partial<T>;
}) => {
  const [state, setState] = useState(() => selector(store.getState()));

  useEffect(() => {
    const unsubscribe = store.subscribe(() =>
      setState(selector(store.getState()))
    );

    setState(selector(store.getState()));
    return () => unsubscribe();
  }, [store, selector]);

  return [state, store.setState];
};
