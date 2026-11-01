import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.security_manager import SecurityManager
from backend.connection_manager import ConnectionManager

class TestConnectionAndSecurity(unittest.TestCase):
    def setUp(self):
        self.security = SecurityManager(required_pin="7492")
        self.connection = ConnectionManager()

    def test_pin_verification(self):
        # Valid pin
        ok, token, msg = self.security.verify_pin("7492", "192.168.1.10")
        self.assertTrue(ok)
        self.assertIsNotNone(token)
        self.assertTrue(self.security.is_authorized(token))

        # Invalid pin
        bad_ok, bad_token, bad_msg = self.security.verify_pin("0000", "192.168.1.11")
        self.assertFalse(bad_ok)
        self.assertIsNone(bad_token)

    def test_packet_recording(self):
        self.connection.register_client("test_sid", {"ip": "192.168.1.5"})
        self.connection.record_packet("test_sid", 32)
        stats = self.connection.get_stats()
        self.assertEqual(stats['total_packets'], 1)
        self.assertEqual(stats['bytes_received'], 32)
        self.assertEqual(stats['active_client_count'], 1)

if __name__ == '__main__':
    unittest.main()
