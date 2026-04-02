// Simple pub/sub for auth events — avoids circular deps between api.ts and authStore.ts
type Listener = () => void;

let onUnauthorized: Listener | null = null;

export const setUnauthorizedHandler = (handler: Listener) => {
  onUnauthorized = handler;
};

export const emitUnauthorized = () => {
  if (onUnauthorized) {
    onUnauthorized();
  }
};
