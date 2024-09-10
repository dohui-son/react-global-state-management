import { createContext, ReactNode, useContext, useRef, useState } from "react";
import {
  createGlobalStateStore,
  GlobalStateStore,
  useGlobalStateStore,
} from "../lib/globalState";
import {
  GlobalStateStoreByEvent,
  useGlobalStateStoreByEvent,
} from "../lib/globalState/event";

type GSS1Type = { state1: number; state2: number };
const store = createGlobalStateStore<GSS1Type>({ state1: 0, state2: 0 });
export default function MainPage() {
  return (
    <div>
      <GlobalStateComponent />
      <StoreProvider initialState={{ contextState1: 0, contextState2: 0 }}>
        <h1>They are inside same provider</h1>
        <a
          href={"https://github.com/pmndrs/zustand#react-context"}
          target="_blank"
          rel="noreferrer noopener"
        >
          descritpion: zustand with context
        </a>
        <ComponentUsingStoreContext title={"React Context 1 🐦"} />
        <ComponentUsingStoreContext title={"React Context 2 🐤"} />
      </StoreProvider>
      <ComponentUsingEvent />
      <h1>They are inside different provider</h1>
      <GlobalStateProvider>
        <ComponentWithContextAndUseState />
      </GlobalStateProvider>
      <GlobalStateProvider>
        <h1>They are inside same provider</h1>
        <ComponentWithContextAndUseState />
        <ComponentWithContextAndUseState />
      </GlobalStateProvider>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 1. [GlobalState] - using selector

function GlobalStateComponent() {
  const [state1, setState] = useGlobalStateStore<GSS1Type>({
    store,
    selector: (state) => state.state1,
  });
  const [state2, _] = useGlobalStateStore<GSS1Type>({
    store,
    selector: (state) => state.state2,
  });
  return (
    <div style={{ borderBottom: "1px solid black", padding: 30, margin: 30 }}>
      <h1>Global State - using selector</h1>
      <div>
        <span style={{ color: "blue" }}>state1 🌏 </span>
        <button
          onClick={() => {
            setState((prev: GSS1Type) => ({
              ...prev,
              state1: prev.state1 + 1,
            }));
          }}
        >
          +
        </button>
        <span> {state1}</span>
      </div>
      <div>
        <span style={{ color: "blue" }}>state2 🌏 </span>
        <button
          onClick={() => {
            setState((prev: GSS1Type) => ({
              ...prev,
              state2: prev.state2 + 1,
            }));
          }}
        >
          +
        </button>
        <span> {state2}</span>
      </div>
    </div>
  );
}

// 2.  [React Context]

type ContextStatesType = { contextState1: number; contextState2: number };

const StoreContext = createContext<GlobalStateStore<ContextStatesType>>(
  createGlobalStateStore({
    contextState1: -1,
    contextState2: -1,
  })
);

function StoreProvider({
  initialState,
  children,
}: {
  initialState: ContextStatesType;
  children: ReactNode;
}) {
  const storeRef = useRef<GlobalStateStore<ContextStatesType>>();
  if (!storeRef.current) {
    storeRef.current = createGlobalStateStore<ContextStatesType>(initialState);
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

function ComponentUsingStoreContext({ title }: { title: string }) {
  const context = useContext(StoreContext);

  return (
    <div style={{ padding: 30, margin: 30 }}>
      <h1>{title}</h1>
      <div>
        <span style={{ color: "red" }}>contextState1 🔠 </span>
        <button
          onClick={async () => {
            context.setState((prev) => ({
              ...prev,
              contextState1: prev.contextState1 - 1,
            }));
            // alert(
            //   "contextState1 is updated: " + context.getState().contextState1
            // );
            console.log(
              title,
              " contextState1 is updated: ",
              context.getState().contextState1
            );
          }}
        >
          -
        </button>
        <span> initial value {context.getInitialState().contextState1}</span>
      </div>
      <div>
        <span style={{ color: "red" }}>contextState1 🔠 </span>
        <button
          onClick={async () => {
            context.setState((prev) => ({
              ...prev,
              contextState2: prev.contextState2 - 1,
            }));
            // alert(
            //   "contextState2 is updated: " + context.getState().contextState2
            // );
            console.log(
              title,
              "contextState2 is updated: ",
              context.getState().contextState2
            );
          }}
        >
          -
        </button>
        <span> initial value {context.getInitialState().contextState2}</span>
      </div>
      show both values{" "}
      <button
        onClick={() => {
          console.log(title, "current contextStates: ", context.getState());
        }}
      >
        👀
      </button>
    </div>
  );
}

// 3.  [event]

type EventGSSType = { withEvent1: number; withEvent2: number };

const eventStateStore = new GlobalStateStoreByEvent<EventGSSType>({
  withEvent1: 0,
  withEvent2: 0,
});

function ComponentUsingEvent() {
  const [stateWithEvent1, setState] = useGlobalStateStoreByEvent<EventGSSType>({
    store: eventStateStore,
    selector: (state) => state.withEvent1,
  });

  const [stateWithEvent2, _] = useGlobalStateStoreByEvent<EventGSSType>({
    store: eventStateStore,
    selector: (state) => state.withEvent2,
  });

  return (
    <div
      style={{
        borderTop: "1px solid black",
        padding: 30,
        margin: 30,
        borderBottom: "1px solid black",
      }}
    >
      <h1>Global State - using event</h1>
      <div>
        <span style={{ color: "green" }}>withEvent1 🥳 </span>
        <button
          onClick={() => {
            setState((prev: EventGSSType) => ({
              ...prev,
              withEvent1: prev.withEvent1 + 1,
            }));
          }}
        >
          +
        </button>
        <span> {stateWithEvent1}</span>
      </div>
      <div>
        <span style={{ color: "green" }}>withEvent2 🥳 </span>
        <button
          onClick={() => {
            setState((prev: EventGSSType) => ({
              ...prev,
              withEvent2: prev.withEvent2 + 1,
            }));
          }}
        >
          +
        </button>
        <span> {stateWithEvent2}</span>
      </div>
    </div>
  );
}

// 4.  [React Context and useState] - using context and useState

type GlobalState = {
  count: number;
  setCount: (count: number) => void;
};

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0);

  return (
    <GlobalStateContext.Provider value={{ count, setCount }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalStateStoreWithContext = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error(
      "useGlobalStateStoreWithContext must be used within a GlobalStateProvider"
    );
  }
  return context;
};

function ComponentWithContextAndUseState() {
  const { count, setCount } = useGlobalStateStoreWithContext();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  );
}
