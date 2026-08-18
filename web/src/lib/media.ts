let pendingStream: MediaStream | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

export function mediaConstraints(callType: string): MediaStreamConstraints {
  return {
    audio: true,
    video: callType === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
  };
}

export function captureStream(stream: MediaStream) {
  releasePending();
  pendingStream = stream;
  pendingTimer = setTimeout(() => {
    if (pendingStream) {
      pendingStream.getTracks().forEach(t => t.stop());
      pendingStream = null;
    }
  }, 30000);
}

export function takeStream(): MediaStream | null {
  const s = pendingStream;
  pendingStream = null;
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  return s;
}

export function releasePending() {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  if (pendingStream) {
    pendingStream.getTracks().forEach(t => t.stop());
    pendingStream = null;
  }
}

export function mediaErrorMessage(err: any): string {
  if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
    return 'Microphone permission denied. Allow access in your browser settings and try again.';
  }
  if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
    return 'No microphone or camera found on this device.';
  }
  if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
    return 'Microphone or camera is already in use by another app or tab.';
  }
  return 'Could not access microphone or camera.';
}
