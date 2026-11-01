"""
Clipboard Manager for Windows 11 Desktop Agent
Synchronizes clipboard text between Android handheld and Windows 11 host.
"""

import time
try:
    import pyperclip
    _pyperclip_available = True
except ImportError:
    _pyperclip_available = False

from .keyboard_controller import KeyboardController

class ClipboardManager:
    def __init__(self, keyboard_controller: KeyboardController):
        self.keyboard = keyboard_controller
        self.last_synced_text = ""

    def get_clipboard_text(self) -> str:
        """Fetch current text residing in the Windows system clipboard"""
        try:
            return pyperclip.paste() or ""
        except Exception as e:
            print(f"[Clipboard] Error getting clipboard: {e}")
            return ""

    def set_clipboard_text(self, text: str) -> bool:
        """Update Windows clipboard with new content"""
        try:
            pyperclip.copy(text)
            self.last_synced_text = text
            return True
        except Exception as e:
            print(f"[Clipboard] Error setting clipboard: {e}")
            return False

    def trigger_copy(self) -> str:
        """Simulate Ctrl+C and return the newly copied text"""
        self.keyboard.tap_key('ctrl') # clear
        # Send Ctrl+C
        if self.keyboard.keyboard:
            from pynput.keyboard import Key
            with self.keyboard.keyboard.pressed(Key.ctrl):
                self.keyboard.keyboard.press('c')
                time.sleep(0.02)
                self.keyboard.keyboard.release('c')
        time.sleep(0.08)
        return self.get_clipboard_text()

    def trigger_paste(self):
        """Simulate Ctrl+V"""
        if self.keyboard.keyboard:
            from pynput.keyboard import Key
            with self.keyboard.keyboard.pressed(Key.ctrl):
                self.keyboard.keyboard.press('v')
                time.sleep(0.02)
                self.keyboard.keyboard.release('v')

    def trigger_cut(self) -> str:
        """Simulate Ctrl+X"""
        if self.keyboard.keyboard:
            from pynput.keyboard import Key
            with self.keyboard.keyboard.pressed(Key.ctrl):
                self.keyboard.keyboard.press('x')
                time.sleep(0.02)
                self.keyboard.keyboard.release('x')
        time.sleep(0.08)
        return self.get_clipboard_text()

    def trigger_select_all(self):
        """Simulate Ctrl+A"""
        if self.keyboard.keyboard:
            from pynput.keyboard import Key
            with self.keyboard.keyboard.pressed(Key.ctrl):
                self.keyboard.keyboard.press('a')
                time.sleep(0.02)
                self.keyboard.keyboard.release('a')
