import { useDebugValue, useSyncExternalStore } from "react";
import { GlobalStateStore, InitialGlobalState } from ".";

export class GlobalStateStoreByEvent<T extends InitialGlobalState> {
  private state: T;
  private initialState: T;
  private eventEmitter: EventTarget;

  constructor(initialState: T) {
    this.state = initialState;
    this.initialState = initialState;
    this.eventEmitter = new EventTarget();
  }

  getInitialState() {
    return this.initialState;
  }

  getState() {
    return this.state;
  }

  setState(nextState: (prev: T) => T) {
    this.state = nextState(this.state);
    // 이벤트 발행
    this.eventEmitter.dispatchEvent(
      new CustomEvent("globalStateChange", { detail: this.state })
    );
  }

  subscribe(callback: () => void) {
    const listener = () => callback();
    // 이벤트 구독
    this.eventEmitter.addEventListener("globalStateChange", listener);

    return () =>
      this.eventEmitter.removeEventListener("globalStateChange", listener);
  }
}

export const useGlobalStateStoreByEvent = <T extends InitialGlobalState>({
  store,
  selector,
}: {
  store: GlobalStateStoreByEvent<T>;
  selector: (state: T) => T[keyof T];
}): [T[keyof T], GlobalStateStore<T>["setState"]] => {
  const state = useSyncExternalStore(
    store.subscribe.bind(store),
    () => selector(store.getState()),
    () => selector(store.getInitialState())
  );

  useDebugValue(state);
  return [state, store.setState.bind(store)];
};
