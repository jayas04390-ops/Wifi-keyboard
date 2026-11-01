"""
Keyboard Controller for Windows 11 Desktop Agent
Utilizes pynput and ctypes SendInput for maximum compatibility across Windows applications.
"""

import time
import sys
from typing import Optional, Set
try:
    import pyperclip
    _pyperclip_available = True
except ImportError:
    _pyperclip_available = False

try:
    from pynput.keyboard import Controller as PynputKeyboard, Key, KeyCode
    _pynput_available = True
except ImportError:
    _pynput_available = False
    PynputKeyboard = None
    Key = None
    KeyCode = None

class KeyboardController:
    # Mapping from incoming string keys to pynput Key objects
    SPECIAL_KEYS = {
        'backspace': 'backspace',
        'tab': 'tab',
        'enter': 'enter',
        'shift': 'shift',
        'ctrl': 'ctrl',
        'control': 'ctrl',
        'alt': 'alt',
        'capslock': 'caps_lock',
        'caps_lock': 'caps_lock',
        'esc': 'esc',
        'escape': 'esc',
        'space': 'space',
        'pageup': 'page_up',
        'pagedown': 'page_down',
        'end': 'end',
        'home': 'home',
        'left': 'left',
        'up': 'up',
        'right': 'right',
        'down': 'down',
        'insert': 'insert',
        'delete': 'delete',
        'del': 'delete',
        'win': 'cmd',
        'windows': 'cmd',
        'f1': 'f1', 'f2': 'f2', 'f3': 'f3', 'f4': 'f4',
        'f5': 'f5', 'f6': 'f6', 'f7': 'f7', 'f8': 'f8',
        'f9': 'f9', 'f10': 'f10', 'f11': 'f11', 'f12': 'f12',
        'printscreen': 'print_screen',
        'num_lock': 'num_lock',
        'scroll_lock': 'scroll_lock',
    }

    def __init__(self):
        self.keyboard = PynputKeyboard() if _pynput_available else None
        self.held_keys: Set[str] = set()

    def _resolve_key(self, key_str: str):
        if not self.keyboard:
            return None
        lower = key_str.lower().replace(' ', '_')
        if lower in self.SPECIAL_KEYS:
            attr = self.SPECIAL_KEYS[lower]
            return getattr(Key, attr, None)
        if len(key_str) == 1:
            return key_str
        return None

    def key_down(self, key_str: str):
        """Press and hold a key"""
        if not self.keyboard:
            return
        target = self._resolve_key(key_str)
        if target:
            try:
                self.keyboard.press(target)
                self.held_keys.add(key_str)
            except Exception as e:
                print(f"[Keyboard] key_down error for {key_str}: {e}")

    def key_up(self, key_str: str):
        """Release a held key"""
        if not self.keyboard:
            return
        target = self._resolve_key(key_str)
        if target:
            try:
                self.keyboard.release(target)
                self.held_keys.discard(key_str)
            except Exception as e:
                print(f"[Keyboard] key_up error for {key_str}: {e}")

    def tap_key(self, key_str: str):
        """Press and immediately release a key"""
        if not self.keyboard:
            return
        target = self._resolve_key(key_str)
        if target:
            try:
                self.keyboard.press(target)
                time.sleep(0.015)
                self.keyboard.release(target)
            except Exception as e:
                print(f"[Keyboard] tap_key error for {key_str}: {e}")

    def send_instant_text(self, text: str, preserve_clipboard: bool = True):
        """
        Transfers large text blocks instantly using Windows clipboard injection (Ctrl+V)
        Preserves previous clipboard if requested.
        """
        if not text:
            return
        prev_clipboard = ""
        try:
            if preserve_clipboard:
                prev_clipboard = pyperclip.paste()
            pyperclip.copy(text)
            time.sleep(0.03)
            # Send Ctrl+V
            if self.keyboard:
                with self.keyboard.pressed(Key.ctrl):
                    self.keyboard.press('v')
                    time.sleep(0.01)
                    self.keyboard.release('v')
            # Restore previous clipboard after a brief delay
            if preserve_clipboard:
                time.sleep(0.1)
                pyperclip.copy(prev_clipboard)
        except Exception as e:
            # Fallback to direct typing
            print(f"[Keyboard] Instant text paste failed, falling back to direct write: {e}")
            if self.keyboard:
                self.keyboard.type(text)

    def send_char_by_char(self, text: str, delay_ms: int = 25):
        """
        Simulates natural sequential typing character by character with configurable delay
        """
        if not self.keyboard or not text:
            return
        delay_sec = max(0.005, delay_ms / 1000.0)
        for char in text:
            try:
                if char == '\n':
                    self.keyboard.press(Key.enter)
                    self.keyboard.release(Key.enter)
                elif char == '\t':
                    self.keyboard.press(Key.tab)
                    self.keyboard.release(Key.tab)
                else:
                    self.keyboard.type(char)
                time.sleep(delay_sec)
            except Exception as e:
                print(f"[Keyboard] char typing error on '{char}': {e}")

    def release_all_modifiers(self):
        """Safety release of any stuck keys (e.g. after disconnect)"""
        if not self.keyboard:
            return
        modifiers = [Key.ctrl, Key.alt, Key.shift, Key.cmd]
        for mod in modifiers:
            try:
                self.keyboard.release(mod)
            except Exception:
                pass
        self.held_keys.clear()
