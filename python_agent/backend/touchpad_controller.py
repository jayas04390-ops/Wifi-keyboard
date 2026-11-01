"""
Touchpad Gesture Processor for Windows 11 Desktop Agent
Interprets multi-touch gestures (taps, two-finger scroll, long press, drag lock)
"""

import time
from typing import Optional
from .mouse_controller import MouseController

class TouchpadController:
    def __init__(self, mouse_controller: MouseController):
        self.mouse = mouse_controller
        self.drag_lock = False
        self.last_tap_time = 0.0

    def handle_touch_move(self, dx: float, dy: float):
        """Standard 1-finger relative movement"""
        self.mouse.move(dx, dy)

    def handle_tap(self, fingers: int = 1):
        """
        1 finger = Left Click
        2 fingers = Right Click
        3 fingers = Middle Click / Task View
        """
        if fingers == 1:
            self.mouse.click('left')
        elif fingers == 2:
            self.mouse.click('right')
        elif fingers == 3:
            self.mouse.click('middle')

    def handle_double_tap(self):
        """Double tap -> Left Double Click"""
        self.mouse.click('left', double=True)

    def handle_two_finger_scroll(self, scroll_x: float, scroll_y: float):
        """
        Two-finger pan scroll.
        scroll_y > 0: scroll up
        scroll_y < 0: scroll down
        """
        # Multiplied for responsive tactile feel
        factor = 0.15
        self.mouse.scroll(scroll_x * factor, scroll_y * factor)

    def toggle_drag_lock(self) -> bool:
        """Toggles dragging state for click-and-hold"""
        self.drag_lock = not self.drag_lock
        if self.drag_lock:
            self.mouse.press('left')
        else:
            self.mouse.release('left')
        return self.drag_lock

    def release_drag_lock(self):
        if self.drag_lock:
            self.drag_lock = False
            self.mouse.release('left')
