import { ReactNode, useRef, Context } from "react";
import { Store, useCreateStore } from "../hook/useCreateStore";

interface Args<T> {
  initialState: T;
  children: ReactNode;
  context: Context<Store<T>>;
}

export const StoreProvider = <T extends unknown>({ initialState, children, context }: Args<T>) => {
  const storeRef = useRef<Store<T>>();
  if (!storeRef.current) {
    storeRef.current = useCreateStore(initialState);
  }

  return <context.Provider value={storeRef.current}>{children}</context.Provider>;
};
