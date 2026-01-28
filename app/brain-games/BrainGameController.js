let failCb = null;
let successCb = null;

export function setBrainGameCallbacks({ onFail, onSuccess }) {
  failCb = onFail;
  successCb = onSuccess;
}

export function triggerFail() {
  failCb?.();
}

export function triggerSuccess() {
  successCb?.();
}

export function resetBrainGameController() {
  failCb = null;
  successCb = null;
}
