import { useDebugValue, useSyncExternalStore } from "react";
import { GlobalStateStore, InitialGlobalState } from ".";

/**
 * @docs event driven global state management - useSyncExternalStore를 사용하여 전역 상태를 구독하고, 이벤트 기반으로 상태를 관리하고 상태 변경 시 이벤트를 통해 구독자에게 알리는 방식
 * @description 전역 상태를 저장하고 관리(이벤트 발생)하는 역할. 이벤트 기반으로 상태 변경을 알림.
 * */
export class GlobalStateStoreByEvent<T extends InitialGlobalState> {
  private state: T;
  private initialState: T;
  private eventEmitter: EventTarget;

  constructor(initialState: T) {
    this.state = initialState;
    this.initialState = initialState;
    this.eventEmitter = new EventTarget(); //이벤트 발행 객체. 이벤트 시스템으로 상태 변화 알림 처리
    //이벤트 발행 및 구독을 위해 EventTarget 객체를 초기화
  }

  /**
   *
   * @description 의도 - 컴포넌트가 처음 마운트되었을 때 사용할 초기 상태를 제공하는 데 사용 목적
   */
  getInitialState() {
    return this.initialState;
  }

  /**
   *
   * @description 현재 상태를 반환. 컴포넌트가 구독할 상태를 가져오는 데 사용
   */
  getState() {
    return this.state;
  }

  /**
   *
   * @description 이전 상태를 인수로 받아 새로운 상태를 반환하는 함수
   */
  setState(nextState: (prev: T) => T) {
    this.state = nextState(this.state);
    // 이벤트 발행
    this.eventEmitter.dispatchEvent(new CustomEvent("globalStateChange", { detail: this.state })); // 상태가 변경되면 globalStateChange 이벤트를 발생시키고 이 이벤트는 상태가 변경된 것을 구독하는 컴포넌트에 알리는 역할
  }

  /**
   *
   * @description 상태가 변경될 때 호출될 콜백 함수를 구독하는 메서드. globalStateChange 이벤트에 리스너를 등록
   */
  subscribe(callback: () => void) {
    const listener = () => callback();
    // 이벤트 구독
    this.eventEmitter.addEventListener("globalStateChange", listener);

    return () => this.eventEmitter.removeEventListener("globalStateChange", listener);
  }
}

/**
 * @docs event driven global state management - useSyncExternalStore를 사용하여 전역 상태를 구독하고, 이벤트 기반으로 상태를 관리하고 업데이트하는 방식
 * @description GlobalStateStoreByEvent 인스턴스를 구독하고, 선택된 상태를 컴포넌트에서 사용할 수 있도록 하는 역할
 * */
export const useGlobalStateStoreByEvent = <T extends InitialGlobalState>({
  store,
  selector,
}: {
  store: GlobalStateStoreByEvent<T>;
  selector: (state: T) => T[keyof T]; // 선택자를 사용하여 상태의 특정 부분을 반환. 이 함수는 상태 전체를 반환하지 않고, 선택된 부분만 반환
}): [T[keyof T], GlobalStateStore<T>["setState"]] => {
  // 외부 데이터 소스와 React 컴포넌트 상태를 동기화하는 새로운 React 훅. 전역 상태와 컴포넌트 상태를 연결
  const state = useSyncExternalStore(
    store.subscribe.bind(store), //전역 상태가 변경될 때 컴포넌트를 다시 렌더링하도록 구독하는 함수
    () => selector(store.getState()),
    () => selector(store.getInitialState())
  );

  useDebugValue(state);
  return [state, store.setState.bind(store)];
};
