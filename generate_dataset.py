"""
Script to generate synthetic SNMP v1 network monitoring dataset.
Generates:
1. network_data.json
2. network_data.csv
Matches all NDM project specifications:
- 8 fictional network devices with multiple interfaces.
- Fictional private IP addresses, MAC addresses, realistic interface names.
- Interface speeds: 100 Mbps (100,000,000 bps) and 1 Gbps (1,000,000,000 bps).
- Cumulative ifInOctets and ifOutOctets counters.
- Strictly calculated inbound_bps, outbound_bps, inbound_utilization, outbound_utilization.
- Coherent timestamps (15-second polling intervals across 15 time steps = 180 total records).
- Scenarios: Normal operations, traffic ramp-up, Warning conditions (70-85%), and Critical bottlenecks (>85%).
"""

import json
import csv
from datetime import datetime, timedelta

devices = [
    {
        "device_name": "Main Router",
        "ip_address": "192.168.1.1",
        "mac_address": "00:1A:2B:3C:4D:01",
        "device_type": "Router",
        "interfaces": [
            {"name": "GigabitEthernet0/0 (WAN)", "speed": 100_000_000, "base_in_mbps": 35.0, "base_out_mbps": 40.0, "spike_at": [7, 8, 9, 10], "spike_severity": "critical"},
            {"name": "GigabitEthernet0/1 (LAN Core Uplink)", "speed": 1_000_000_000, "base_in_mbps": 120.0, "base_out_mbps": 150.0, "spike_at": [], "spike_severity": "normal"}
        ]
    },
    {
        "device_name": "Core Switch",
        "ip_address": "192.168.1.2",
        "mac_address": "00:1A:2B:3C:4D:02",
        "device_type": "Switch",
        "interfaces": [
            {"name": "GigabitEthernet1/0/1 (Uplink to Router)", "speed": 1_000_000_000, "base_in_mbps": 150.0, "base_out_mbps": 120.0, "spike_at": [], "spike_severity": "normal"},
            {"name": "GigabitEthernet1/0/2 (Trunk to Dist-01)", "speed": 1_000_000_000, "base_in_mbps": 80.0, "base_out_mbps": 75.0, "spike_at": [11, 12, 13], "spike_severity": "warning"},
            {"name": "GigabitEthernet1/0/3 (Trunk to Dist-02)", "speed": 1_000_000_000, "base_in_mbps": 70.0, "base_out_mbps": 65.0, "spike_at": [], "spike_severity": "normal"}
        ]
    },
    {
        "device_name": "Distribution Switch 01",
        "ip_address": "192.168.1.3",
        "mac_address": "00:1A:2B:3C:4D:03",
        "device_type": "Switch",
        "interfaces": [
            {"name": "GigabitEthernet0/1 (Uplink Core)", "speed": 1_000_000_000, "base_in_mbps": 75.0, "base_out_mbps": 80.0, "spike_at": [], "spike_severity": "normal"},
            {"name": "FastEthernet0/1 (Downlink Acc-01)", "speed": 100_000_000, "base_in_mbps": 25.0, "base_out_mbps": 30.0, "spike_at": [5, 6], "spike_severity": "warning"}
        ]
    },
    {
        "device_name": "Distribution Switch 02",
        "ip_address": "192.168.1.4",
        "mac_address": "00:1A:2B:3C:4D:04",
        "device_type": "Switch",
        "interfaces": [
            {"name": "GigabitEthernet0/1 (Uplink Core)", "speed": 1_000_000_000, "base_in_mbps": 65.0, "base_out_mbps": 70.0, "spike_at": [], "spike_severity": "normal"},
            {"name": "FastEthernet0/1 (Downlink Acc-02)", "speed": 100_000_000, "base_in_mbps": 20.0, "base_out_mbps": 22.0, "spike_at": [], "spike_severity": "normal"}
        ]
    },
    {
        "device_name": "Access Switch 01",
        "ip_address": "192.168.1.5",
        "mac_address": "00:1A:2B:3C:4D:05",
        "device_type": "Switch",
        "interfaces": [
            {"name": "FastEthernet0/1 (Uplink Dist-01)", "speed": 100_000_000, "base_in_mbps": 30.0, "base_out_mbps": 25.0, "spike_at": [], "spike_severity": "normal"},
            {"name": "GigabitEthernet0/1 (Server Link App)", "speed": 1_000_000_000, "base_in_mbps": 90.0, "base_out_mbps": 110.0, "spike_at": [8, 9, 10], "spike_severity": "warning"}
        ]
    },
    {
        "device_name": "Access Switch 02",
        "ip_address": "192.168.1.6",
        "mac_address": "00:1A:2B:3C:4D:06",
        "device_type": "Switch",
        "interfaces": [
            {"name": "FastEthernet0/1 (Uplink Dist-02)", "speed": 100_000_000, "base_in_mbps": 22.0, "base_out_mbps": 20.0, "spike_at": [], "spike_severity": "normal"},
            {"name": "GigabitEthernet0/1 (Server Link DB)", "speed": 1_000_000_000, "base_in_mbps": 85.0, "base_out_mbps": 95.0, "spike_at": [], "spike_severity": "normal"}
        ]
    },
    {
        "device_name": "Application Server",
        "ip_address": "192.168.1.50",
        "mac_address": "00:1A:2B:3C:4D:50",
        "device_type": "Server",
        "interfaces": [
            {"name": "eth0 (Production Web/App)", "speed": 1_000_000_000, "base_in_mbps": 110.0, "base_out_mbps": 90.0, "spike_at": [8, 9, 10], "spike_severity": "warning"},
            {"name": "eth1 (Management / Backup)", "speed": 100_000_000, "base_in_mbps": 5.0, "base_out_mbps": 8.0, "spike_at": [12, 13, 14], "spike_severity": "critical"}
        ]
    },
    {
        "device_name": "Database Server",
        "ip_address": "192.168.1.60",
        "mac_address": "00:1A:2B:3C:4D:60",
        "device_type": "Server",
        "interfaces": [
            {"name": "eth0 (Database Engine Port)", "speed": 1_000_000_000, "base_in_mbps": 95.0, "base_out_mbps": 85.0, "spike_at": [], "spike_severity": "normal"}
        ]
    }
]

# We will generate 15 time steps (15 * 14 interfaces = 210 records > 100 required)
# Time interval: 15 seconds per poll
TIME_STEP_SECONDS = 15
START_TIME = datetime(2026, 11, 17, 10, 0, 0)
NUM_STEPS = 15

# Initial base counter values (simulating running uptime)
records = []

# Keep state of previous counters per device+interface
state = {}
for dev in devices:
    for iface in dev["interfaces"]:
        key = (dev["device_name"], iface["name"])
        # Base initial octets around 50 GB to 120 GB
        init_in = 50_000_000_000 + hash(key) % 10_000_000_000
        init_out = 45_000_000_000 + hash(key + ("out",)) % 10_000_000_000
        state[key] = {
            "ifInOctets": init_in,
            "ifOutOctets": init_out
        }

for step in range(NUM_STEPS):
    current_time = START_TIME + timedelta(seconds=step * TIME_STEP_SECONDS)
    timestamp_str = current_time.strftime("%Y-%m-%d %H:%M:%S")

    for dev in devices:
        for iface in dev["interfaces"]:
            key = (dev["device_name"], iface["name"])
            speed = iface["speed"]
            speed_mbps = speed / 1_000_000.0

            # Determine traffic multiplier based on spike schedule
            in_mbps = iface["base_in_mbps"]
            out_mbps = iface["base_out_mbps"]

            # Slight pseudo-random fluctuation based on step
            jitter_in = (step % 5 - 2) * 1.5
            jitter_out = ((step + 2) % 5 - 2) * 1.2
            in_mbps = max(2.0, in_mbps + jitter_in)
            out_mbps = max(2.0, out_mbps + jitter_out)

            if step in iface["spike_at"]:
                if iface["spike_severity"] == "critical":
                    # Critical spike: 88% - 94% utilization
                    out_mbps = speed_mbps * 0.91
                    in_mbps = speed_mbps * 0.65
                elif iface["spike_severity"] == "warning":
                    # Warning spike: 74% - 82% utilization
                    in_mbps = speed_mbps * 0.78
                    out_mbps = speed_mbps * 0.55

            # Calculate bps
            inbound_bps = int(in_mbps * 1_000_000)
            outbound_bps = int(out_mbps * 1_000_000)

            # Cumulative octet increase = (bps * delta_t) / 8
            delta_in_octets = int((inbound_bps * TIME_STEP_SECONDS) / 8)
            delta_out_octets = int((outbound_bps * TIME_STEP_SECONDS) / 8)

            current_in_octets = state[key]["ifInOctets"] + delta_in_octets
            current_out_octets = state[key]["ifOutOctets"] + delta_out_octets

            # Re-derive exact bps from octet difference to guarantee mathematical consistency
            calc_inbound_bps = round(((current_in_octets - state[key]["ifInOctets"]) * 8) / TIME_STEP_SECONDS, 2)
            calc_outbound_bps = round(((current_out_octets - state[key]["ifOutOctets"]) * 8) / TIME_STEP_SECONDS, 2)

            inbound_util = round((calc_inbound_bps / speed) * 100, 2)
            outbound_util = round((calc_outbound_bps / speed) * 100, 2)

            max_util = max(inbound_util, outbound_util)
            if max_util >= 85.0:
                status = "Critical"
            elif max_util >= 70.0:
                status = "Warning"
            else:
                status = "Normal"

            record = {
                "timestamp": timestamp_str,
                "device_name": dev["device_name"],
                "ip_address": dev["ip_address"],
                "mac_address": dev["mac_address"],
                "interface_name": iface["name"],
                "ifSpeed": speed,
                "ifInOctets": current_in_octets,
                "ifOutOctets": current_out_octets,
                "inbound_bps": calc_inbound_bps,
                "outbound_bps": calc_outbound_bps,
                "inbound_utilization": inbound_util,
                "outbound_utilization": outbound_util,
                "status": status
            }
            records.append(record)

            # Update state for next step
            state[key]["ifInOctets"] = current_in_octets
            state[key]["ifOutOctets"] = current_out_octets

# Write to JSON
with open("network_data.json", "w", encoding="utf-8") as f:
    json.dump({
        "metadata": {
            "title": "Automated Network Bandwidth Bottleneck Detection and Alert System Using SNMP v1 - Synthetic Dataset",
            "type": "Synthetic demonstration data (RFC 1157 SNMP v1 MIB-II Interface Group simulation)",
            "generated_at": datetime.now().isoformat(),
            "total_records": len(records),
            "device_count": len(devices),
            "polling_interval_seconds": TIME_STEP_SECONDS,
            "disclaimer": "This is synthetic demonstration data generated for academic coursework and simulation purposes. It does not represent physical hardware traffic."
        },
        "records": records
    }, f, indent=2)

# Write to CSV
fieldnames = [
    "timestamp", "device_name", "ip_address", "mac_address", "interface_name",
    "ifSpeed", "ifInOctets", "ifOutOctets", "inbound_bps", "outbound_bps",
    "inbound_utilization", "outbound_utilization", "status"
]

with open("network_data.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for r in records:
        writer.writerow(r)

print(f"Generated {len(records)} records successfully into network_data.json and network_data.csv.")
