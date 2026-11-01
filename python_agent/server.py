"""
SmartWiFiKeyboard - Windows 11 Desktop Agent
Main Server running Flask-SocketIO & Native Windows Input Controllers
"""

import sys
import os
import time
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, disconnect

import config
from backend.security_manager import SecurityManager
from backend.keyboard_controller import KeyboardController
from backend.mouse_controller import MouseController
from backend.touchpad_controller import TouchpadController
from backend.clipboard_manager import ClipboardManager
from backend.media_controller import MediaController
from backend.shortcut_manager import ShortcutManager
from backend.connection_manager import ConnectionManager

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Initialize Controllers
security = SecurityManager(config.DEFAULT_PIN)
keyboard = KeyboardController()
mouse = MouseController(config.MOUSE_SENSITIVITY, config.MOUSE_ACCELERATION)
touchpad = TouchpadController(mouse)
clipboard = ClipboardManager(keyboard)
media = MediaController()
shortcuts = ShortcutManager(keyboard)
connections = ConnectionManager()

# Map session IDs to authentication state
authenticated_sessions = set()

@app.route('/')
def index():
    return jsonify({
        "status": "online",
        "agent": "SmartWiFiKeyboard Windows 11 Agent",
        "version": "1.0.0",
        "stats": connections.get_stats()
    })

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "online",
        "pin_required": config.REQUIRE_PIN,
        "active_clients": len(authenticated_sessions),
        "local_ips": connections.get_local_ip_addresses(),
        "port": config.PORT
    })

# --- WebSocket Handlers ---

@socketio.on('connect')
def handle_connect():
    sid = request.sid
    client_ip = request.remote_addr or "127.0.0.1"
    connections.register_client(sid, {"ip": client_ip})
    print(f"[Agent] Client connected: {sid} from {client_ip}")
    emit('connection_ack', {
        'status': 'connected',
        'pin_required': config.REQUIRE_PIN,
        'server_time': time.time()
    })

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    authenticated_sessions.discard(sid)
    connections.unregister_client(sid)
    # Release any stuck modifiers or mouse buttons
    keyboard.release_all_modifiers()
    mouse.release('left')
    print(f"[Agent] Client disconnected: {sid}")

@socketio.on('authenticate')
def handle_auth(data):
    sid = request.sid
    pin = data.get('pin', '')
    client_ip = request.remote_addr or "127.0.0.1"
    
    success, token, msg = security.verify_pin(pin, client_ip)
    if success:
        authenticated_sessions.add(sid)
        print(f"[Agent] Authentication successful for {sid}")
        emit('auth_result', {'success': True, 'token': token, 'message': msg})
    else:
        print(f"[Agent] Authentication failed for {sid}: {msg}")
        emit('auth_result', {'success': False, 'message': msg})

def check_auth() -> bool:
    if not config.REQUIRE_PIN:
        return True
    return request.sid in authenticated_sessions

# --- Mouse & Touchpad Events ---

@socketio.on('mouse_move')
def handle_mouse_move(data):
    if not check_auth():
        return
    dx = float(data.get('dx', 0))
    dy = float(data.get('dy', 0))
    connections.record_packet(request.sid, 16)
    mouse.move(dx, dy)

@socketio.on('mouse_click')
def handle_mouse_click(data):
    if not check_auth():
        return
    btn = data.get('button', 'left')
    double = bool(data.get('double', False))
    connections.record_packet(request.sid, 12)
    mouse.click(btn, double)

@socketio.on('mouse_press')
def handle_mouse_press(data):
    if not check_auth():
        return
    btn = data.get('button', 'left')
    mouse.press(btn)

@socketio.on('mouse_release')
def handle_mouse_release(data):
    if not check_auth():
        return
    btn = data.get('button', 'left')
    mouse.release(btn)

@socketio.on('mouse_scroll')
def handle_mouse_scroll(data):
    if not check_auth():
        return
    dx = float(data.get('dx', 0))
    dy = float(data.get('dy', 0))
    mouse.scroll(dx, dy)

@socketio.on('touchpad_gesture')
def handle_touchpad_gesture(data):
    if not check_auth():
        return
    gtype = data.get('type')
    if gtype == 'tap':
        touchpad.handle_tap(int(data.get('fingers', 1)))
    elif gtype == 'double_tap':
        touchpad.handle_double_tap()
    elif gtype == 'two_finger_scroll':
        touchpad.handle_two_finger_scroll(float(data.get('dx', 0)), float(data.get('dy', 0)))
    elif gtype == 'toggle_drag':
        is_dragging = touchpad.toggle_drag_lock()
        emit('drag_state', {'dragging': is_dragging})

# --- Keyboard Events ---

@socketio.on('key_down')
def handle_key_down(data):
    if not check_auth():
        return
    key = data.get('key')
    if key:
        keyboard.key_down(str(key))

@socketio.on('key_up')
def handle_key_up(data):
    if not check_auth():
        return
    key = data.get('key')
    if key:
        keyboard.key_up(str(key))

@socketio.on('key_tap')
def handle_key_tap(data):
    if not check_auth():
        return
    key = data.get('key')
    if key:
        keyboard.tap_key(str(key))

# --- Advanced Text Transfer ---

@socketio.on('text_transfer')
def handle_text_transfer(data):
    if not check_auth():
        return
    mode = data.get('mode', 'instant')
    text = data.get('text', '')
    if not text:
        return

    if mode == 'instant':
        keyboard.send_instant_text(text)
        emit('text_transfer_complete', {'mode': 'instant', 'length': len(text)})
    elif mode == 'char_by_char':
        speed_cps = int(data.get('speedCps', 30))
        delay_ms = max(5, int(1000 / max(1, speed_cps)))
        keyboard.send_char_by_char(text, delay_ms)
        emit('text_transfer_complete', {'mode': 'char_by_char', 'length': len(text)})

# --- Clipboard Integration ---

@socketio.on('clipboard_sync')
def handle_clipboard_sync(data):
    if not check_auth():
        return
    action = data.get('action')
    if action == 'get':
        content = clipboard.get_clipboard_text()
        emit('clipboard_content', {'text': content})
    elif action == 'set':
        text = data.get('text', '')
        clipboard.set_clipboard_text(text)
        emit('clipboard_ack', {'success': True})
    elif action == 'copy':
        copied = clipboard.trigger_copy()
        emit('clipboard_content', {'text': copied})
    elif action == 'paste':
        clipboard.trigger_paste()
    elif action == 'cut':
        cut_text = clipboard.trigger_cut()
        emit('clipboard_content', {'text': cut_text})
    elif action == 'select_all':
        clipboard.trigger_select_all()

# --- Media & System Controls ---

@socketio.on('media_control')
def handle_media(data):
    if not check_auth():
        return
    action = data.get('action')
    if action == 'vol_up':
        media.volume_up()
    elif action == 'vol_down':
        media.volume_down()
    elif action == 'mute':
        media.volume_mute()
    elif action == 'play_pause':
        media.play_pause()
    elif action == 'next':
        media.next_track()
    elif action == 'prev':
        media.prev_track()
    elif action == 'stop':
        media.stop()
    elif action == 'lock':
        media.lock_workstation()
    elif action == 'sleep':
        media.sleep_pc()
    elif action == 'brightness_up':
        media.adjust_brightness(10)
    elif action == 'brightness_down':
        media.adjust_brightness(-10)

# --- Shortcuts ---

@socketio.on('shortcut')
def handle_shortcut(data):
    if not check_auth():
        return
    keys = data.get('keys', [])
    if isinstance(keys, list) and len(keys) > 0:
        shortcuts.execute_shortcut([str(k) for k in keys])

# --- Latency Ping/Pong ---

@socketio.on('ping')
def handle_ping(data):
    client_ts = data.get('client_timestamp', time.time() * 1000)
    server_ts = time.time() * 1000
    emit('pong', {'client_timestamp': client_ts, 'server_timestamp': server_ts})

def print_banner():
    ips = connections.get_local_ip_addresses()
    print("=" * 60)
    print("  CyberTactile - WiFi Keyboard & Mouse Windows 11 Agent")
    print("=" * 60)
    print(f"  Listening on: http://{config.HOST}:{config.PORT}")
    print("  Host Local Network IP Addresses:")
    for ip in ips:
        print(f"    -> http://{ip}:{config.PORT}")
    print(f"  Security PIN: {config.DEFAULT_PIN}")
    print("  Connect your Android smartphone via WiFi or Hotspot.")
    print("=" * 60)

if __name__ == '__main__':
    print_banner()
    try:
        socketio.run(app, host=config.HOST, port=config.PORT, debug=config.DEBUG)
    except KeyboardInterrupt:
        print("\n[Agent] Shutting down Windows 11 desktop agent gracefully...")
