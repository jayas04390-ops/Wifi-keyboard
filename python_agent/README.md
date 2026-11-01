# CyberTactile - Windows 11 WiFi Keyboard & Mouse Agent

Control your Windows 11 PC from any Android smartphone via WiFi or Mobile Hotspot with ultra-low latency, full virtual keyboard, multi-touch trackpad, instant text transfer, media dials, and shortcuts.

---

## ⚡ Prerequisites

- **Host OS**: Windows 11 (or Windows 10)
- **Mobile**: Android 11+ (Chrome, Firefox, Samsung Internet)
- **Python**: Python 3.9+ installed on Windows (Add to PATH checked during install)
- **Network**: Both PC and Phone connected to the same WiFi network or Android Mobile Hotspot

---

## 🚀 Quick Setup Guide (Windows 11)

### 1. Open PowerShell or Terminal in the `python_agent` directory:
```powershell
cd python_agent
```

### 2. Create and activate a Virtual Environment (Recommended):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install required packages:
```powershell
pip install -r requirements.txt
```

### 4. Run the Agent:
```powershell
python server.py
```

### 5. Allow Windows Defender Firewall (First Run):
When prompted by Windows Defender, check **Private networks** and click **Allow access**.
Or manually allow port 8765 via PowerShell (Administrator):
```powershell
New-NetFirewallRule -DisplayName "CyberTactile WiFi Agent" -Direction Inbound -LocalPort 8765 -Protocol TCP -Action Allow
```

---

## 📱 Connecting your Smartphone

1. The terminal will print your Host Local IP address (e.g. `http://192.168.1.45:8765`).
2. On your Android phone, open Chrome and navigate to the web app URL.
3. Tap the **Pairing / WiFi** status badge in the top bar.
4. Enter the **Security PIN** displayed in your Windows terminal (default: `7492`).
5. You are now connected with sub-5ms low-latency input streaming!

---

## 🛠️ Features Included

- **Full QWERTY Keyboard**: A-Z, 0-9, Symbols, Modifiers (Ctrl, Alt, Shift, Win), F1-F12, Arrows, Nav cluster.
- **Precision Trackpad**: Smooth pointer glide, single-tap left click, two-finger right click, two-finger smooth scroll, double tap & drag lock.
- **Two Text Transfer Modes**:
  - *Instant Mode*: Pastes large blocks immediately via clipboard without character delays.
  - *Character-by-Character Mode*: Types sequentially with adjustable speed (CPS) slider.
- **Clipboard Sync**: Send phone clipboard to Windows PC or read PC clipboard remotely.
- **Quick Shortcuts**: Windows 11 window management (Win+D, Win+E, Win+L, Task Manager, Alt+Tab, etc.).
- **Media Remote**: Big volume dial, mute, play/pause, track skip, screen brightness, presentation slides.

---

## 🧪 Running Unit Tests

```powershell
python -m unittest discover tests
```
