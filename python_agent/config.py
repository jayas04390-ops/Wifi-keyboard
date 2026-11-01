# SmartWiFiKeyboard Configuration
# Windows 11 Desktop Agent

import os

# Network configuration
HOST = '0.0.0.0'
PORT = 8765
DEBUG = False

# Security & Pairing
REQUIRE_PIN = True
DEFAULT_PIN = "7492"  # 4-digit numeric pairing PIN
SESSION_TIMEOUT_SECONDS = 86400  # 24 hours

# Input Sensitivity & Performance
MOUSE_SENSITIVITY = 1.35
MOUSE_ACCELERATION = True
SCROLL_SENSITIVITY = 1.0
SMOOTH_SCROLLING = True
TYPING_DEFAULT_CPS = 30  # Characters per second for char-by-char mode

# Telemetry
PING_INTERVAL = 2.0  # seconds
MAX_INPUT_QUEUE = 250
