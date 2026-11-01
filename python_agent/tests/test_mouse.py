import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.mouse_controller import MouseController
from backend.touchpad_controller import TouchpadController

class TestMouseController(unittest.TestCase):
    def setUp(self):
        self.mouse = MouseController(sensitivity=1.5, acceleration=True)
        self.touchpad = TouchpadController(self.mouse)

    def test_sensitivity_clamping(self):
        self.mouse.set_sensitivity(10.0)
        self.assertEqual(self.mouse.sensitivity, 4.0)
        self.mouse.set_sensitivity(0.01)
        self.assertEqual(self.mouse.sensitivity, 0.2)

    def test_drag_lock_toggle(self):
        initial = self.touchpad.drag_lock
        toggled = self.touchpad.toggle_drag_lock()
        self.assertEqual(toggled, not initial)
        self.touchpad.release_drag_lock()
        self.assertFalse(self.touchpad.drag_lock)

if __name__ == '__main__':
    unittest.main()
