"""
Security & Device Pairing Manager for Windows 11 WiFi Agent
Handles PIN verification, authorized device session tokens, and connection rate limiting.
"""

import time
import secrets
import hashlib
from typing import Dict, Optional
import config

class SecurityManager:
    def __init__(self, required_pin: str = config.DEFAULT_PIN):
        self.required_pin = str(required_pin)
        self.authorized_tokens: Dict[str, float] = {}  # token -> expiration timestamp
        self.failed_attempts: Dict[str, int] = {}       # ip -> attempt count
        self.lockouts: Dict[str, float] = {}            # ip -> lockout until timestamp

    def verify_pin(self, candidate_pin: str, client_ip: str = "127.0.0.1") -> tuple[bool, Optional[str], str]:
        """
        Validates candidate PIN. Returns (success, session_token, message)
        """
        now = time.time()
        
        # Check lockout
        if client_ip in self.lockouts and now < self.lockouts[client_ip]:
            remaining = int(self.lockouts[client_ip] - now)
            return False, None, f"Too many failed attempts. Try again in {remaining}s"

        if not config.REQUIRE_PIN or str(candidate_pin).strip() == self.required_pin:
            # Success, clear failed attempts
            self.failed_attempts.pop(client_ip, None)
            token = secrets.token_hex(16)
            self.authorized_tokens[token] = now + config.SESSION_TIMEOUT_SECONDS
            return True, token, "Authentication successful"
        else:
            attempts = self.failed_attempts.get(client_ip, 0) + 1
            self.failed_attempts[client_ip] = attempts
            if attempts >= 5:
                self.lockouts[client_ip] = now + 60  # 1 minute lockout
                return False, None, "Too many failed attempts. Locked for 60s"
            return False, None, f"Invalid PIN. {5 - attempts} attempts remaining"

    def is_authorized(self, token: Optional[str]) -> bool:
        """Checks if a session token is valid and not expired"""
        if not config.REQUIRE_PIN:
            return True
        if not token or token not in self.authorized_tokens:
            return False
        if time.time() > self.authorized_tokens[token]:
            del self.authorized_tokens[token]
            return False
        return True

    def revoke_token(self, token: str):
        self.authorized_tokens.pop(token, None)

    def set_pin(self, new_pin: str):
        self.required_pin = str(new_pin).strip()
        self.authorized_tokens.clear()
