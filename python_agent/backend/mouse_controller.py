"""
Mouse & Cursor Controller for Windows 11 Desktop Agent
Provides high-precision pointer movement, multi-button clicks, and smooth scrolling.
"""

import time
import math
from typing import Literal

try:
    from pynput.mouse import Controller as PynputMouse, Button
    _pynput_mouse_available = True
except ImportError:
    _pynput_mouse_available = False

try:
    import pyautogui
    pyautogui.FAILSAFE = False  # Avoid crashing when moving to screen corners
    _pyautogui_available = True
except ImportError:
    _pyautogui_available = False

class MouseController:
    def __init__(self, sensitivity: float = 1.35, acceleration: bool = True):
        self.mouse = PynputMouse() if _pynput_mouse_available else None
        self.sensitivity = sensitivity
        self.acceleration = acceleration
        self.is_dragging = False

    def move(self, dx: float, dy: float):
        """
        Move the cursor relatively by dx and dy with optional acceleration curve
        """
        if not self.mouse:
            return

        # Apply sensitivity
        mx = dx * self.sensitivity
        my = dy * self.sensitivity

        # Non-linear acceleration for natural thumb touchpad feel
        if self.acceleration:
            dist = math.hypot(mx, my)
            if dist > 8.0:
                factor = 1.0 + min(1.2, (dist - 8.0) * 0.04)
                mx *= factor
                my *= factor

        try:
            self.mouse.move(int(round(mx)), int(round(my)))
        except Exception as e:
            print(f"[Mouse] move error: {e}")

    def click(self, button_name: str = 'left', double: bool = False):
        """Perform a click or double-click"""
        if not self.mouse:
            return
        btn = Button.left
        if button_name == 'right':
            btn = Button.right
        elif button_name == 'middle':
            btn = Button.middle

        try:
            click_count = 2 if double else 1
            self.mouse.click(btn, click_count)
        except Exception as e:
            print(f"[Mouse] click error: {e}")

    def press(self, button_name: str = 'left'):
        """Hold mouse button down (e.g. for drag-and-drop or select)"""
        if not self.mouse:
            return
        btn = Button.right if button_name == 'right' else Button.left
        try:
            self.mouse.press(btn)
            self.is_dragging = True
        except Exception as e:
            print(f"[Mouse] press error: {e}")

    def release(self, button_name: str = 'left'):
        """Release mouse button"""
        if not self.mouse:
            return
        btn = Button.right if button_name == 'right' else Button.left
        try:
            self.mouse.release(btn)
            self.is_dragging = False
        except Exception as e:
            print(f"[Mouse] release error: {e}")

    def scroll(self, dx: float, dy: float):
        """
        Scroll wheel movement.
        Positive dy scrolls up, negative dy scrolls down.
        Positive dx scrolls right, negative dx scrolls left.
        """
        if not self.mouse:
            return
        try:
            # pynput mouse.scroll(dx, dy)
            # dy is inverted on some touchpads
            self.mouse.scroll(int(round(dx)), int(round(dy)))
        except Exception as e:
            print(f"[Mouse] scroll error: {e}")

    def set_sensitivity(self, val: float):
        self.sensitivity = max(0.2, min(4.0, float(val)))
