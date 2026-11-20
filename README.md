# Automated Network Bandwidth Bottleneck Detection and Alert System Using SNMP v1

**Subject:** Network Design and Management (NDM)  
**Project Type:** Full-Stack Network Telemetry, Monitoring & Alerting System  
**Dataset Type:** Synthetic SNMP v1 MIB-II Interface Group Telemetry (`network_data.json`, `network_data.csv`)

---

## 1. Project Title & Overview

**"Automated Network Bandwidth Bottleneck Detection and Alert System Using SNMP v1"** is an interactive, enterprise-grade network monitoring and automated incident response dashboard. The system continuously polls network devices (routers, switches, and servers) using SNMP v1 protocol mechanics, samples cumulative byte counters (`ifInOctets`, `ifOutOctets`), derives accurate full-duplex incoming and outgoing bit rates, detects network bottlenecks against configurable capacity thresholds, and dispatches automated administrator alerts.

---

## 2. Problem Statement

In contemporary enterprise networks, uncontrolled bandwidth consumption across core uplinks, distribution trunks, and server interfaces introduces severe operational risks:

1. **Queue Buffer Bloat:** High sustained utilization causes interface packet buffers to fill, introducing exponential queuing delays ($T = \frac{1}{\mu C - \lambda}$).
2. **Tail-Drop Packet Loss & Jitter:** Once buffers saturate, switches drop incoming frames, causing TCP window collapse, voice/video degradation, and transaction timeouts.
3. **Reactive Troubleshooting:** Traditional manual inspection fails to identify intermittent or sudden traffic bursts until end users report application outages.
4. **Asymmetric Traffic Oversights:** Simply summing inbound and outbound traffic hides unidirectional bottleneck saturation on full-duplex links.

There is a critical need for an automated, proactive monitoring system that continuously tracks interface-level traffic, identifies bottlenecks in real time, and alerts administrators before network collapse.

---

## 3. Proposed Solution

This project implements an automated SNMP v1 telemetry engine and administrative dashboard:

- **Periodic MIB Polling:** Samples MIB-II Interface Group objects (`ifSpeed`, `ifInOctets`, `ifOutOctets`) via simulated SNMP GET requests.
- **Delta Rate Derivation:** Computes bit-per-second throughput mathematically from consecutive cumulative counter readings.
- **Independent Full-Duplex Evaluation:** Evaluates inbound and outbound channel utilization percentages independently against bandwidth capacity (`ifSpeed`).
- **Dynamic Threshold Classification:** Categorizes interface health into **Normal (<70%)**, **Warning (70% - 85%)**, and **Critical (≥85%)**.
- **Automated Incident Alerting:** Instantly generates categorized alerts, plays synthesized audio chimes/sirens (Web Audio API), highlights affected topology cables, and maintains audit logs in persistent local storage.
- **Interactive Faculty Presentation Mode:** Guided 10-step walkthrough designed for academic defense.

---

## 4. Technologies Used

- **Frontend Framework:** React 18 (Functional components, custom Hooks, Context API)
- **Build Tool & Bundler:** Vite 6 (Ultra-fast HMR and optimized ES module bundling)
- **Styling Solution:** Tailwind CSS v3 (Enterprise dark charcoal/navy theme `#0a0f1d`, cyan/emerald/amber/red accents)
- **Charts & Telemetry Graphs:** Recharts (Interactive SVG Area and Line charts with custom tooltips)
- **Icons & Visuals:** Lucide React (Clean, vendor-neutral enterprise networking icons)
- **Audio Synthesizer:** Web Audio API (`AudioContext` oscillator tones — 100% client-side, zero external audio assets required)
- **Dataset Generator:** Python 3 (Mathematical generation of cumulative counters into JSON and CSV)
- **Storage:** HTML5 LocalStorage (Persistence of alert incidents, user thresholds, and audio preferences)

---

## 5. SNMP v1 Architecture & Protocol Concepts

The Simple Network Management Protocol version 1 (**SNMP v1**, defined in **RFC 1157**) is an application-layer protocol operating over UDP (port 161 for agent polling, port 162 for traps).

### Core Components:

1. **SNMP Manager (NMS):** The monitoring application that issues `GetRequest-PDU` messages to query managed devices.
2. **SNMP Agent:** Software daemon running natively on routers, switches, and servers that maintains real-time hardware instrumentation in kernel memory.
3. **Management Information Base (MIB):** A hierarchical, vendor-independent tree of managed objects. This project focuses on the **RFC 1213 MIB-II Interface Group** (`1.3.6.1.2.1.2.2.1`).

### Relevant MIB-II Interface Objects:

| Object Name | OID | Data Type | Description |
|---|---|---|---|
| **ifIndex** | `1.3.6.1.2.1.2.2.1.1` | INTEGER | Unique interface identifier index (1..N). |
| **ifDescr** | `1.3.6.1.2.1.2.2.1.2` | DisplayString | Text description (e.g., `GigabitEthernet0/0 (WAN)`). |
| **ifSpeed** | `1.3.6.1.2.1.2.2.1.5` | Gauge32 | Bandwidth capacity in bits per second (e.g., 100,000,000 bps for 100M, 1,000,000,000 bps for 1G). |
| **ifPhysAddress** | `1.3.6.1.2.1.2.2.1.6` | PhysAddress | Hardware MAC address of the interface. |
| **ifOperStatus** | `1.3.6.1.2.1.2.2.1.8` | INTEGER | Operational status: `up(1)`, `down(2)`, `testing(3)`. |
| **ifInOctets** | `1.3.6.1.2.1.2.2.1.10` | Counter32 | Total cumulative bytes received on the interface. |
| **ifOutOctets** | `1.3.6.1.2.1.2.2.1.16` | Counter32 | Total cumulative bytes transmitted out of the interface. |

---

## 6. Bandwidth Calculation & Mathematical Formulas

In SNMP v1, network devices do not store current bit rates directly. The SNMP Manager must sample cumulative counters at two distinct time points ($t_0$ and $t_1$) separated by $\Delta t$ seconds.

### Inbound Traffic Rate:
$$\text{inbound\_bps} = \frac{(\text{current\_ifInOctets} - \text{previous\_ifInOctets}) \times 8}{\Delta t}$$

### Outbound Traffic Rate:
$$\text{outbound\_bps} = \frac{(\text{current\_ifOutOctets} - \text{previous\_ifOutOctets}) \times 8}{\Delta t}$$

Where:
- $\Delta t = t_{\text{current}} - t_{\text{previous}}$ (in seconds, typically 3 to 15 seconds).
- Multiplying octets (bytes) by 8 converts the measurement into bits.

### Full-Duplex Utilization Percentage:
$$\text{inbound\_utilization} = \left( \frac{\text{inbound\_bps}}{\text{ifSpeed}} \right) \times 100$$

$$\text{outbound\_utilization} = \left( \frac{\text{outbound\_bps}}{\text{ifSpeed}} \right) \times 100$$

$$\text{peak\_utilization} = \max(\text{inbound\_utilization}, \text{outbound\_utilization})$$

> **Important Engineering Principle:** In modern switched full-duplex Ethernet, the transmit (Tx) and receive (Rx) pairs operate concurrently without collisions. Adding inbound and outbound utilization together is incorrect because each direction has its own dedicated physical wire capacity. They must be evaluated separately.

---

## 7. Threshold Configuration & Bottleneck Detection

The system evaluates `peak_utilization` against configurable threshold boundaries:

- **Normal Band:** $\text{Utilization} < 70\%$  
  *Operational state:* Traffic is flowing freely; switch buffer queues are clear; latency is minimal.
- **Warning Band:** $70\% \le \text{Utilization} < 85\%$  
  *Operational state:* Approaching physical capacity; burst queuing occurs; warning alert dispatched to administrator.
- **Critical Bottleneck:** $\text{Utilization} \ge 85\%$  
  *Operational state:* Impending interface queue saturation, risk of tail-drop packet loss and latency spikes; high-priority critical incident alert generated with sirens and on-screen banners.

---

## 8. Synthetic Dataset Description

The project includes an authentic synthetic network dataset generated using `generate_dataset.py` and exported to:
- `network_data.json`
- `network_data.csv`

### Monitored Devices (8 Fictional Network Nodes):

1. **Main Router** (`192.168.1.1`, MAC: `00:1A:2B:3C:4D:01`) — WAN Edge Router (100 Mbps WAN uplink, 1 Gbps LAN trunk)
2. **Core Switch** (`192.168.1.2`, MAC: `00:1A:2B:3C:4D:02`) — Campus Gigabit Backbone
3. **Distribution Switch 01** (`192.168.1.3`, MAC: `00:1A:2B:3C:4D:03`) — Building A Aggregation Switch
4. **Distribution Switch 02** (`192.168.1.4`, MAC: `00:1A:2B:3C:4D:04`) — Building B Aggregation Switch
5. **Access Switch 01** (`192.168.1.5`, MAC: `00:1A:2B:3C:4D:05`) — App Server Pod Switch
6. **Access Switch 02** (`192.168.1.6`, MAC: `00:1A:2B:3C:4D:06`) — DB Server Pod Switch
7. **Application Server** (`192.168.1.50`, MAC: `00:1A:2B:3C:4D:50`) — Web/App Host (Production Web port + Backup port)
8. **Database Server** (`192.168.1.60`, MAC: `00:1A:2B:3C:4D:60`) — PostgreSQL Database Cluster

### Dataset Fields:

| Column | Description | Example |
|---|---|---|
| `timestamp` | Time reading was recorded | `2026-11-17 10:00:00` |
| `device_name` | Name of network device | `Main Router` |
| `ip_address` | Private IP address | `192.168.1.1` |
| `mac_address` | Physical MAC address | `00:1A:2B:3C:4D:01` |
| `interface_name` | Port identifier | `GigabitEthernet0/0 (WAN)` |
| `ifSpeed` | Bandwidth capacity in bps | `100000000` (100 Mbps) |
| `ifInOctets` | Cumulative incoming byte counter | `59614144049` |
| `ifOutOctets` | Cumulative outgoing byte counter | `52865366675` |
| `inbound_bps` | Calculated incoming bit rate | `32000000.0` (32 Mbps) |
| `outbound_bps` | Calculated outgoing bit rate | `40000000.0` (40 Mbps) |
| `inbound_utilization` | Inbound bandwidth utilization % | `32.0` |
| `outbound_utilization` | Outbound bandwidth utilization % | `40.0` |
| `status` | Computed state (`Normal`, `Warning`, `Critical`) | `Normal` |

> *Disclaimer:* This dataset contains **synthetic demonstration telemetry** mathematically modeled to reflect real SNMP MIB-II counter dynamics for academic simulation.

---

## 9. Dashboard Pages and System Features

The application provides 8 operational pages plus a dedicated presentation mode:

1. **Network Overview (Page 1):**
   - 6 KPI cards (Total Devices, Active Devices, Avg Utilization, Peak Utilization, Warning Alerts, Critical Alerts).
   - Network Health Index Score (0 - 100).
   - Real-time aggregate inbound/outbound bandwidth trend chart.
   - Most congested interface spotlight and live alert preview.

2. **Bandwidth Monitoring (Page 2):**
   - Device and interface dropdown selectors.
   - Dual historical traffic charts (Inbound rate vs Outbound rate).
   - Full-duplex utilization progress bars.
   - MIB-II Interface Group OID reference table.

3. **Device Monitoring (Page 3):**
   - Comprehensive matrix table of all 8 devices and 14 interfaces.
   - Live search filter (by device, IP, or interface).
   - Status filters (`ALL`, `Normal`, `Warning`, `Critical`) and device type filters.
   - One-click modal drilldown for hardware specs, uptime, and counters.

4. **Congestion Detection (Page 4):**
   - Visual utilization spectrum bar based on queuing theory.
   - 4 Interactive simulation buttons:
     - `1. Normal Traffic`: Sets healthy baseline load (<70%).
     - `2. Trigger Warning`: Elevates Core Switch trunk to ~78% utilization.
     - `3. Trigger Critical`: Spikes Main Router WAN to ~93% utilization.
     - `4. Reset Simulation`: Cleans states and restores normal operations.
   - List of currently congested interfaces with peak rates.

5. **Alert Management (Page 5):**
   - Central incident response table with alert ID, timestamp, device, and severity.
   - Administrator action buttons: `Acknowledge` and `Resolve`.
   - Severity filters and `Clear Resolved` option.
   - Audio alarm notification toggle (Web Audio API).

6. **Network Topology (Page 6):**
   - Interactive SVG diagram: `Internet → Main Router → Core Switch → Dist Switches → Access Switches → Servers`.
   - Dynamic cable color coding (green, amber, or flashing red for bottlenecks).
   - Clickable device nodes opening real-time telemetry inspector drawers.

7. **How The System Works (Page 7):**
   - Interactive 4-stage pipeline stepper:
     `POLL (SNMP GET) → CALCULATE (Delta bytes * 8 / dt) → DETECT (Threshold check) → ALERT (Dispatch)`.
     Detailed architecture breakdown of SNMP Manager, Agent, and MIB-II.

8. **Settings (Page 8):**
   - Interactive sliders for Warning and Critical threshold percentages.
   - Polling interval adjustment (1 to 10 seconds).
   - Monitoring pause/resume toggle.
   - Reset to default settings (70% Warning, 85% Critical).

9. **Faculty Presentation Mode (Page 9):**
   - 10-step guided walkthrough structured for a 5-minute academic presentation.
   - Embedded interactive simulation controls on relevant slides.
   - Direct step navigation dots and speaker talking points.

---

## 10. How to Run the Project Locally

### Prerequisites:
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### Steps to Run:

1. Open a terminal in the project directory:
   ```bash
   cd "c:\Users\manda\OneDrive\Desktop\NDM Project"
   ```

2. Dependencies are already installed. If needed, install dependencies via:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

5. (Optional) To build a production bundle:
   ```bash
   npm run build
   npm run preview
   ```

---

## 11. Faculty Demonstration Script (5-Minute Walkthrough)

To present the project smoothly to your professor or evaluation panel:

1. Click **Faculty Presentation Mode** in the sidebar.
2. **Slide 1-4:** Explain the problem of bottleneck congestion, SNMP v1 architecture, MIB-II OIDs (`ifSpeed`, `ifInOctets`, `ifOutOctets`), and full-duplex delta calculations.
3. **Slide 5 (Normal Condition):** Click **"Apply Normal Traffic Conditions"**. Point out that all devices show green status and utilization remains below 70%.
4. **Slide 6 (Warning Condition):** Click **"Trigger Warning Traffic Spike"**. Show that the Core Switch trunk climbs to ~78%, status turns amber, and a Warning alert is generated.
5. **Slide 7 (Critical Congestion):** Click **"Trigger Critical Bottleneck"**. Show the Main Router WAN interface saturation at 93%. Highlight the prominent red alert banner, audio alarm, and red cable on the topology map.
6. **Slide 8-9 (Alert Lifecycle):** Click **"Acknowledge Incident"** and then **"Resolve Incident"**. Explain that alerts are persisted in LocalStorage.
7. **Slide 10 (Conclusion):** Summarize the project deliverables and invite questions.

---

## 12. Project Folder Structure

```
NDM Project/
├── index.html                   # Application entry HTML with dark theme styling
├── package.json                 # Project dependencies (React 18, Vite, Tailwind, Recharts)
├── vite.config.js               # Vite build configuration (Port 3000)
├── tailwind.config.js           # Custom enterprise network color scheme
├── postcss.config.js            # PostCSS Autoprefixer plugin configuration
├── generate_dataset.py          # Python script that generates synthetic SNMP dataset
├── network_data.json            # Synthetic dataset in JSON format (240 records)
├── network_data.csv             # Synthetic dataset in CSV format
├── README.md                    # Complete project documentation and manual
└── src/
    ├── main.jsx                 # React root renderer
    ├── App.jsx                  # Main dashboard layout and routing controller
    ├── index.css                # Tailwind directives and pulse animations
    ├── context/
    │   └── NetworkContext.jsx   # Core SNMP polling engine, formulas, state & alerts
    ├── data/
    │   └── networkDataset.js    # Device metadata, topology nodes/links, MIB definitions
    ├── utils/
    │   └── audioAlert.js        # Web Audio API sound synthesizer
    ├── components/
    │   ├── Sidebar.jsx          # Enterprise sidebar navigation with active alert badges
    │   ├── Header.jsx           # Top header bar with quick simulation buttons & clock
    │   ├── AlertBanner.jsx      # Prominent top warning/critical notification banner
    │   └── DeviceDetailModal.jsx# Diagnostic modal for device & interface drilldowns
    └── pages/
        ├── NetworkOverview.jsx  # Page 1: Dashboard KPIs, health index & trend chart
        ├── BandwidthMonitoring.jsx # Page 2: Inbound/outbound traffic graphs & MIB info
        ├── DeviceMonitoring.jsx # Page 3: Device table with filters & search
        ├── CongestionDetection.jsx # Page 4: Threshold spectrum & simulation triggers
        ├── AlertManagement.jsx  # Page 5: Incident queue, acknowledge & resolve
        ├── NetworkTopology.jsx  # Page 6: Interactive SVG topology map & node inspector
        ├── HowItWorks.jsx       # Page 7: 4-stage pipeline stepper & SNMP architecture
        ├── Settings.jsx         # Page 8: Threshold sliders, polling interval & audio
        └── PresentationMode.jsx # Page 9: 10-step guided defense presentation
```

---

## 13. Limitations & Future Roadmap

### Current Version Limitations:
- Utilizes synthetic SNMP MIB telemetry generated mathematically rather than communicating with physical routers over a hardware console.
- In-dashboard administrator alerts simulate external email/SMS notifications using local browser banners, badges, and Web Audio API synthesizer chimes.
- Host-level information is simulated; real SNMP v1 interface counters measure aggregate traffic at the switch port rather than per-process host traffic.

### Future Enhancements:
- **Real SNMP Connectivity:** Implement an asynchronous Python backend (using `pysnmp` or `net-snmp`) to query physical Cisco/MikroTik lab hardware over UDP port 161.
- **SNMP v2c / v3 Support:** Upgrade to 64-bit high-capacity counters (`ifHCInOctets`, `ifHCOutOctets`) defined in RFC 2863 to prevent counter rollover on 10 Gbps and 100 Gbps interfaces, and introduce cryptographic HMAC-SHA authentication.
- **Webhook & Email Dispatch:** Integrate SendGrid or Discord/Slack webhooks to send real external messages upon Critical threshold breaches.

---

*Developed for the Network Design and Management (NDM) Subject.*
