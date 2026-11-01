"""
Media & System Controller for Windows 11 Desktop Agent
Dispatches multimedia keys (Volume, Play/Pause, Track nav) and power/lock commands.
"""

import sys
import os
import subprocess

try:
    from pynput.keyboard import Controller as PynputKeyboard, Key
    _pynput_available = True
except ImportError:
    _pynput_available = False

# Windows Virtual Key Codes
VK_VOLUME_MUTE = 0xAD
VK_VOLUME_DOWN = 0xAE
VK_VOLUME_UP = 0xAF
VK_MEDIA_NEXT_TRACK = 0xB0
VK_MEDIA_PREV_TRACK = 0xB1
VK_MEDIA_STOP = 0xB2
VK_MEDIA_PLAY_PAUSE = 0xB3

class MediaController:
    def __init__(self):
        self.keyboard = PynputKeyboard() if _pynput_available else None
        self.is_windows = sys.platform.startswith('win')

    def _send_win_vk(self, vk_code: int):
        """Sends native Windows virtual key press using ctypes user32 keybd_event"""
        if self.is_windows:
            try:
                import ctypes
                user32 = ctypes.windll.user32
                KEYEVENTF_EXTENDEDKEY = 0x0001
                KEYEVENTF_KEYUP = 0x0002
                user32.keybd_event(vk_code, 0, KEYEVENTF_EXTENDEDKEY, 0)
                user32.keybd_event(vk_code, 0, KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP, 0)
                return True
            except Exception as e:
                print(f"[Media] ctypes keybd_event failed: {e}")
        return False

    def volume_up(self):
        if not self._send_win_vk(VK_VOLUME_UP):
            if self.keyboard and hasattr(Key, 'media_volume_up'):
                self.keyboard.tap(Key.media_volume_up)

    def volume_down(self):
        if not self._send_win_vk(VK_VOLUME_DOWN):
            if self.keyboard and hasattr(Key, 'media_volume_down'):
                self.keyboard.tap(Key.media_volume_down)

    def volume_mute(self):
        if not self._send_win_vk(VK_VOLUME_MUTE):
            if self.keyboard and hasattr(Key, 'media_volume_mute'):
                self.keyboard.tap(Key.media_volume_mute)

    def play_pause(self):
        if not self._send_win_vk(VK_MEDIA_PLAY_PAUSE):
            if self.keyboard and hasattr(Key, 'media_play_pause'):
                self.keyboard.tap(Key.media_play_pause)

    def next_track(self):
        if not self._send_win_vk(VK_MEDIA_NEXT_TRACK):
            if self.keyboard and hasattr(Key, 'media_next'):
                self.keyboard.tap(Key.media_next)

    def prev_track(self):
        if not self._send_win_vk(VK_MEDIA_PREV_TRACK):
            if self.keyboard and hasattr(Key, 'media_previous'):
                self.keyboard.tap(Key.media_previous)

    def stop(self):
        self._send_win_vk(VK_MEDIA_STOP)

    def lock_workstation(self):
        """Locks the Windows workstation (Win+L equivalent)"""
        if self.is_windows:
            try:
                import ctypes
                ctypes.windll.user32.LockWorkStation()
            except Exception as e:
                print(f"[Media] LockWorkStation error: {e}")
                os.system("rundll32.exe user32.dll,LockWorkStation")

    def sleep_pc(self):
        """Puts Windows PC to sleep"""
        if self.is_windows:
            os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")

    def adjust_brightness(self, delta: int):
        """Adjusts display brightness via Windows PowerShell WMI if supported"""
        if self.is_windows:
            try:
                cmd = f"(Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1, [math]::min(100, [math]::max(0, (Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightness).CurrentBrightness + {delta})))"
                subprocess.Popen(["powershell", "-NoProfile", "-Command", cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except Exception as e:
                print(f"[Media] Brightness adjust error: {e}")
