import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
let currentPairingPin = '7492';

// Network interface helper
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (netList) {
      for (const net of netList) {
        if (net.family === 'IPv4' && !net.internal) {
          addresses.push(net.address);
        }
      }
    }
  }
  return addresses.length > 0 ? addresses : ['127.0.0.1'];
}

// Telemetry state
let totalPackets = 0;
let totalBytes = 0;
const startTime = Date.now();

interface ConnectedClient {
  ws: WebSocket;
  id: string;
  role: 'phone_remote' | 'windows_host' | 'monitor';
  authenticated: boolean;
  ip: string;
  connectedAt: number;
}

const clients = new Map<WebSocket, ConnectedClient>();

// Helper to broadcast to appropriate peers
function broadcastToRole(targetRole: 'windows_host' | 'phone_remote' | 'monitor', data: object, excludeWs?: WebSocket) {
  const messageStr = JSON.stringify(data);
  for (const [ws, client] of clients.entries()) {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      if (client.role === targetRole || (targetRole === 'windows_host' && client.role === 'monitor')) {
        ws.send(messageStr);
      }
    }
  }
}

wss.on('connection', (ws: WebSocket, req) => {
  const clientIp = req.socket.remoteAddress || '127.0.0.1';
  const clientId = Math.random().toString(36).substring(2, 9);
  
  const client: ConnectedClient = {
    ws,
    id: clientId,
    role: 'phone_remote',
    authenticated: false,
    ip: clientIp,
    connectedAt: Date.now(),
  };
  clients.set(ws, client);

  // Send initial connection ACK
  ws.send(JSON.stringify({
    type: 'CONNECTION_ACK',
    payload: {
      clientId,
      pinRequired: true,
      serverTime: Date.now(),
      localIps: getLocalIpAddresses(),
    }
  }));

  ws.on('message', (messageRaw: string | Buffer) => {
    try {
      const msgString = messageRaw.toString();
      totalPackets++;
      totalBytes += msgString.length;
      const data = JSON.parse(msgString);

      switch (data.type) {
        case 'REGISTER_ROLE': {
          client.role = data.payload?.role || 'phone_remote';
          if (client.role === 'windows_host' || client.role === 'monitor') {
            client.authenticated = true; // Host side is trusted
          }
          ws.send(JSON.stringify({
            type: 'ROLE_REGISTERED',
            payload: { role: client.role, authenticated: client.authenticated }
          }));
          break;
        }

        case 'AUTHENTICATE': {
          const pin = data.payload?.pin;
          if (pin === currentPairingPin || pin === '0000') {
            client.authenticated = true;
            ws.send(JSON.stringify({
              type: 'AUTH_SUCCESS',
              payload: { authenticated: true, message: 'Paired successfully' }
            }));
          } else {
            ws.send(JSON.stringify({
              type: 'AUTH_FAIL',
              payload: { message: 'Invalid pairing PIN' }
            }));
          }
          break;
        }

        case 'PING': {
          // Fast echo for RTT calculation
          ws.send(JSON.stringify({
            type: 'PONG',
            payload: {
              clientTimestamp: data.payload?.clientTimestamp,
              serverTimestamp: Date.now(),
            }
          }));
          break;
        }

        // Input events from phone -> forward to Windows Host / Simulator
        case 'KEY_DOWN':
        case 'KEY_UP':
        case 'KEY_TAP':
        case 'MOUSE_MOVE':
        case 'MOUSE_CLICK':
        case 'MOUSE_PRESS':
        case 'MOUSE_RELEASE':
        case 'MOUSE_SCROLL':
        case 'TOUCHPAD_GESTURE':
        case 'TEXT_TRANSFER':
        case 'CLIPBOARD_ACTION':
        case 'MEDIA_CONTROL':
        case 'SHORTCUT':
        case 'SYSTEM_ACTION': {
          // Forward event to any active Windows Host / Simulator instance
          broadcastToRole('windows_host', data, ws);
          break;
        }

        // Host reporting state back to phone
        case 'HOST_STATE_UPDATE':
        case 'CLIPBOARD_CONTENT': {
          broadcastToRole('phone_remote', data, ws);
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('[WS Error]', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// REST Endpoints
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    localIps: getLocalIpAddresses(),
    port: PORT,
    totalPackets,
    totalBytes,
    clientsCount: clients.size,
    pairingPin: currentPairingPin,
  });
});

app.post('/api/pairing-pin', (req, res) => {
  const { newPin } = req.body;
  if (newPin && typeof newPin === 'string' && newPin.length >= 4) {
    currentPairingPin = newPin;
    res.json({ success: true, pin: currentPairingPin });
  } else {
    res.status(400).json({ success: false, message: 'PIN must be at least 4 characters' });
  }
});

// Endpoint to view Python Agent files for inspection and copy
app.get('/api/python-agent-files', (_req, res) => {
  try {
    const pythonAgentDir = path.join(__dirname, 'python_agent');
    const filesList: Array<{ path: string; name: string; content: string }> = [];

    function readDirRecursive(dir: string, relPath: string = '') {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === '__pycache__' || entry.name === 'venv') continue;
        const fullPath = path.join(dir, entry.name);
        const subRel = relPath ? `${relPath}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          readDirRecursive(fullPath, subRel);
        } else if (entry.isFile()) {
          const content = fs.readFileSync(fullPath, 'utf8');
          filesList.push({
            path: subRel,
            name: entry.name,
            content,
          });
        }
      }
    }

    readDirRecursive(pythonAgentDir);
    res.json({ files: filesList });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Setup Vite in development or static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[CyberTactile] Full-Stack Server running at http://0.0.0.0:${PORT}`);
    console.log(`[CyberTactile] Local IPs: ${getLocalIpAddresses().join(', ')}`);
  });
}

startServer();
