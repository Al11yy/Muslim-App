import { DeviceEventEmitter } from 'react-native';

const TAB_BAR_SCROLL_EVENT = 'muslim-app:tab-bar-scroll';
const EMIT_THROTTLE_MS = 140;

let lastEmitAt = 0;

export function notifyTabBarScroll() {
  const now = Date.now();
  if (now - lastEmitAt < EMIT_THROTTLE_MS) return;
  lastEmitAt = now;
  DeviceEventEmitter.emit(TAB_BAR_SCROLL_EVENT);
}

export function subscribeTabBarScroll(listener: () => void) {
  const subscription = DeviceEventEmitter.addListener(TAB_BAR_SCROLL_EVENT, listener);
  return () => subscription.remove();
}
