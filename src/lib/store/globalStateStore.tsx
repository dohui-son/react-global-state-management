import { ReactNode, useRef } from "react";
import { Store, useCreateStore } from "../hook/useCreateStore";
import { createContext } from "vm";

interface Args<T> {
  initialState: T;
  children: ReactNode;
  store: Store<T>;
}

export const StoreProvider = <T extends unknown>({ initialState, children, store }: Args<T>) => {
  const StoreContext = createContext(store);

  const storeRef = useRef<Store<T>>();
  if (!storeRef.current) {
    storeRef.current = useCreateStore(initialState);
  }

  return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>;
};
