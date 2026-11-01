"""
Shortcut Manager for Windows 11 Desktop Agent
Executes system and productivity key combinations reliably.
"""

import time
from typing import List
from .keyboard_controller import KeyboardController

try:
    from pynput.keyboard import Key
    _pynput_available = True
except ImportError:
    _pynput_available = False

class ShortcutManager:
    def __init__(self, keyboard_controller: KeyboardController):
        self.keyboard = keyboard_controller

    def execute_shortcut(self, keys: List[str]):
        """
        Executes a sequence of simultaneous key presses.
        Example: ['ctrl', 'alt', 'del'] or ['win', 'd']
        """
        if not self.keyboard.keyboard or not keys:
            return

        resolved_keys = []
        for k in keys:
            resolved = self.keyboard._resolve_key(k)
            if resolved is not None:
                resolved_keys.append(resolved)

        if not resolved_keys:
            return

        try:
            # Press down in order
            for rk in resolved_keys:
                self.keyboard.keyboard.press(rk)
                time.sleep(0.015)

            # Hold briefly
            time.sleep(0.03)

            # Release in reverse order
            for rk in reversed(resolved_keys):
                self.keyboard.keyboard.release(rk)
                time.sleep(0.01)
        except Exception as e:
            print(f"[Shortcut] Failed executing {keys}: {e}")
            self.keyboard.release_all_modifiers()

    # Pre-built standard shortcuts
    def show_desktop(self):
        """Win + D"""
        self.execute_shortcut(['win', 'd'])

    def open_explorer(self):
        """Win + E"""
        self.execute_shortcut(['win', 'e'])

    def task_view(self):
        """Win + Tab"""
        self.execute_shortcut(['win', 'tab'])

    def snipping_tool(self):
        """Win + Shift + S"""
        self.execute_shortcut(['win', 'shift', 's'])

    def task_manager(self):
        """Ctrl + Shift + Esc"""
        self.execute_shortcut(['ctrl', 'shift', 'esc'])

    def switch_window(self):
        """Alt + Tab"""
        self.execute_shortcut(['alt', 'tab'])

    def close_window(self):
        """Alt + F4"""
        self.execute_shortcut(['alt', 'f4'])
