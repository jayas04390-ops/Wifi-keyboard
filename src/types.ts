export type ViewMode = 
  | 'touchpad' 
  | 'keyboard' 
  | 'text_transfer' 
  | 'shortcuts' 
  | 'media' 
  | 'python_agent';

export interface TelemetryData {
  rttMs: number;
  packetsSent: number;
  packetsReceived: number;
  lastPingTime: number;
  status: 'connected' | 'connecting' | 'disconnected' | 'paired';
  localIps: string[];
  port: number;
  clientRole: 'phone_remote' | 'windows_host' | 'monitor';
}

export type MouseButton = 'left' | 'right' | 'middle';

export interface MouseEventPayload {
  dx?: number;
  dy?: number;
  button?: MouseButton;
  double?: boolean;
}

export interface TouchpadGesturePayload {
  type: 'tap' | 'double_tap' | 'two_finger_scroll' | 'toggle_drag';
  fingers?: number;
  dx?: number;
  dy?: number;
}

export interface KeyActionPayload {
  key: string;
  modifiers?: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    win: boolean;
  };
}

export interface TextTransferPayload {
  mode: 'instant' | 'char_by_char';
  text: string;
  speedCps?: number;
}

export interface MediaActionPayload {
  action: 
    | 'vol_up' 
    | 'vol_down' 
    | 'mute' 
    | 'play_pause' 
    | 'next' 
    | 'prev' 
    | 'stop' 
    | 'lock' 
    | 'sleep' 
    | 'brightness_up' 
    | 'brightness_down';
}

export interface ShortcutPayload {
  keys: string[];
  name?: string;
}

export interface CustomShortcut {
  id: string;
  name: string;
  keys: string[];
  color?: string;
}
