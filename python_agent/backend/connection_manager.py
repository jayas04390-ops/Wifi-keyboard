"""
Connection Manager for Windows 11 Desktop Agent
Discovers host network IP, manages active WebSocket connections, and collects telemetry.
"""

import socket
import time
from typing import Dict, Any, List

class ConnectionManager:
    def __init__(self):
        self.active_clients: Dict[str, Dict[str, Any]] = {}
        self.packet_count = 0
        self.bytes_received = 0
        self.start_time = time.time()

    def get_local_ip_addresses(self) -> List[str]:
        """Retrieves non-loopback local IPv4 addresses (LAN/Hotspot)"""
        ips = []
        try:
            # Connect to external dummy address to detect preferred route
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.settimeout(0.1)
            s.connect(("8.8.8.8", 80))
            primary_ip = s.getsockname()[0]
            s.close()
            if primary_ip and primary_ip != "127.0.0.1":
                ips.append(primary_ip)
        except Exception:
            pass

        try:
            hostname = socket.gethostname()
            for ip in socket.gethostbyname_ex(hostname)[2]:
                if not ip.startswith("127.") and ip not in ips:
                    ips.append(ip)
        except Exception:
            pass

        return ips or ["127.0.0.1"]

    def register_client(self, sid: str, device_info: Dict[str, Any]):
        self.active_clients[sid] = {
            'connected_at': time.time(),
            'device_info': device_info,
            'last_ping': time.time(),
            'rtt_ms': 0.0,
            'packets': 0
        }

    def unregister_client(self, sid: str):
        self.active_clients.pop(sid, None)

    def record_packet(self, sid: str, byte_size: int = 64):
        self.packet_count += 1
        self.bytes_received += byte_size
        if sid in self.active_clients:
            self.active_clients[sid]['packets'] += 1
            self.active_clients[sid]['last_ping'] = time.time()

    def update_rtt(self, sid: str, rtt_ms: float):
        if sid in self.active_clients:
            self.active_clients[sid]['rtt_ms'] = round(rtt_ms, 2)

    def get_stats(self) -> Dict[str, Any]:
        uptime = int(time.time() - self.start_time)
        return {
            'uptime_seconds': uptime,
            'active_client_count': len(self.active_clients),
            'total_packets': self.packet_count,
            'bytes_received': self.bytes_received,
            'local_ips': self.get_local_ip_addresses()
        }
