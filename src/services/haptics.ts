/**
 * Device vibration haptic feedback for Android smartphones
 */

class HapticsService {
  public enabled: boolean = true;

  public light() {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(8);
    } catch {}
  }

  public medium() {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(15);
    } catch {}
  }

  public heavy() {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([25, 20, 25]);
    } catch {}
  }

  public doubleTap() {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([10, 30, 10]);
    } catch {}
  }
}

export const hapticsService = new HapticsService();
