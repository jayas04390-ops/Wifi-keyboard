import { TelemetryData } from '../types';

type MessageHandler = (data: { type: string; payload?: unknown }) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private pingInterval: number | null = null;
  private reconnectTimeout: number | null = null;

  public telemetry: TelemetryData = {
    rttMs: 2.4, // Initial nominal latency
    packetsSent: 0,
    packetsReceived: 0,
    lastPingTime: Date.now(),
    status: 'connecting',
    localIps: ['192.168.1.105'],
    port: 3000,
    clientRole: 'phone_remote',
  };

  public isPaired: boolean = false;
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.connect();
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private notify() {
    this.subscribers.forEach((cb) => cb());
  }

  public connect() {
    if (typeof window === 'undefined') return;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);
      this.telemetry.status = 'connecting';
      this.notify();

      this.ws.onopen = () => {
        this.telemetry.status = 'connected';
        this.startPingLoop();
        this.send('REGISTER_ROLE', { role: 'phone_remote' });
        // Auto authenticate with default PIN
        this.authenticate('7492');
        this.notify();
      };

      this.ws.onmessage = (event) => {
        try {
          this.telemetry.packetsReceived++;
          const data = JSON.parse(event.data);

          if (data.type === 'PONG') {
            const clientSent = data.payload?.clientTimestamp;
            if (clientSent) {
              const rtt = Math.max(1, Date.now() - clientSent);
              this.telemetry.rttMs = rtt;
            }
          } else if (data.type === 'CONNECTION_ACK') {
            if (data.payload?.localIps) {
              this.telemetry.localIps = data.payload.localIps;
            }
          } else if (data.type === 'AUTH_SUCCESS') {
            this.isPaired = true;
            this.telemetry.status = 'paired';
          }

          this.messageHandlers.forEach((handler) => handler(data));
          this.notify();
        } catch {
          // parse error
        }
      };

      this.ws.onclose = () => {
        this.telemetry.status = 'disconnected';
        this.stopPingLoop();
        this.notify();
        // Auto reconnect after 2 seconds
        this.reconnectTimeout = window.setTimeout(() => this.connect(), 2000);
      };

      this.ws.onerror = () => {
        // error handling
      };
    } catch {
      this.telemetry.status = 'disconnected';
      this.notify();
    }
  }

  public authenticate(pin: string) {
    this.send('AUTHENTICATE', { pin });
  }

  private startPingLoop() {
    this.stopPingLoop();
    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('PING', { clientTimestamp: Date.now() });
      }
    }, 2000);
  }

  private stopPingLoop() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public send(type: string, payload?: unknown) {
    this.telemetry.packetsSent++;
    const message = { type, payload, timestamp: Date.now() };

    // Dispatches to local handlers as well so the simulated Windows 11 host immediately reacts
    this.messageHandlers.forEach((handler) => handler(message));

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch {}
    }
    this.notify();
  }

  public onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }
}

export const socketService = new SocketService();
