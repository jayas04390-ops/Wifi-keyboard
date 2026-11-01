import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.keyboard_controller import KeyboardController

class TestKeyboardController(unittest.TestCase):
    def setUp(self):
        self.keyboard = KeyboardController()

    def test_special_key_mapping(self):
        self.assertEqual(self.keyboard.SPECIAL_KEYS.get('enter'), 'enter')
        self.assertEqual(self.keyboard.SPECIAL_KEYS.get('backspace'), 'backspace')
        self.assertEqual(self.keyboard.SPECIAL_KEYS.get('f1'), 'f1')
        self.assertEqual(self.keyboard.SPECIAL_KEYS.get('win'), 'cmd')

    def test_held_keys_tracking(self):
        self.assertIsInstance(self.keyboard.held_keys, set)
        self.keyboard.release_all_modifiers()
        self.assertEqual(len(self.keyboard.held_keys), 0)

if __name__ == '__main__':
    unittest.main()
