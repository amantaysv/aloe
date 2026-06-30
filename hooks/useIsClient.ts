"use client";

import { useSyncExternalStore } from "react";

const _noop = () => () => {};

export function useIsClient() {
  return useSyncExternalStore(
    _noop,
    () => true,
    () => false,
  );
}
