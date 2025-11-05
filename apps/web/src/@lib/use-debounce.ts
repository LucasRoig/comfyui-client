"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Callback = (...args: any[]) => void;

export const useDebounce = <T extends Callback | undefined>(callback: T, delay = 500): T => {
  const ref = useRef<T>(null);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    function f(this: any, ...args: any[]) {
      ref.current?.apply(this, args);
    }

    return debounce(f, delay);
  }, [delay]);

  return debouncedCallback as T;
};

export function useDebouncedState<T>(initialValue: T, delay: number) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const debouncedSetter = useDebounce(setDebouncedValue, delay);
  useEffect(() => {
    debouncedSetter(value);
  }, [value, debouncedSetter]);
  return { value, setValue, debouncedValue } as const;
}

function debounce<T extends Callback>(callback: T, delay = 500): T {
  let timerId: ReturnType<typeof setTimeout>;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return function (this: any, ...args: any[]) {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  } as T;
}
