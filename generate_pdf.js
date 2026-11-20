import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('Coding_Proof_Screenshots');

function getBase64Image(filename) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return '';
  }
  const bitmap = fs.readFileSync(filePath);
  return `data:image/png;base64,${bitmap.toString('base64')}`;
}

async function buildPdf() {
  console.log('--- Generating High-Quality Project Coding Proof Document ---');

  const imgDash = getBase64Image('01_dashboard_overview.png');
  const imgBw = getBase64Image('02_bandwidth_monitoring.png');
  const imgDev = getBase64Image('03_device_monitoring.png');
  const imgDrill = getBase64Image('04_device_drilldown.png');
  const imgTopo = getBase64Image('05_network_topology.png');
  const imgHow = getBase64Image('06_how_it_works.png');
  const imgSet = getBase64Image('07_settings_page.png');
  const imgNorm = getBase64Image('08_normal_condition.png');
  const imgWarn = getBase64Image('09_warning_condition.png');
  const imgAlertWarn = getBase64Image('10_alert_warning.png');
  const imgCrit = getBase64Image('11_critical_condition.png');
  const imgAlertAct = getBase64Image('12_alert_management_active.png');
  const imgProbNo = getBase64Image('13_problem_not_resolved.png');
  const imgProbYes = getBase64Image('14_problem_resolved_history.png');
  const imgArch = getBase64Image('15_architecture_diagram.png');
  const imgJson = getBase64Image('16_dataset_json_proof.png');
  const imgCsv = getBase64Image('17_dataset_csv_proof.png');
  const imgCodeFormulas = getBase64Image('18_code_formulas_proof.png');
  const imgCodeAlert = getBase64Image('19_code_alert_dispatch_proof.png');
  const imgCodePy = getBase64Image('20_code_dataset_generator_proof.png');

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Project Coding Proof - Automated Network Bandwidth Bottleneck Detection and Alert System Using SNMP v1</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 18mm 18mm 20mm 18mm;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
        font-family: "Times New Roman", Times, serif;
        font-size: 11pt;
        line-height: 1.45;
        color: #000;
        background: #fff;
      }
      /* Cover Page (Strictly restricted to Title and 2-column Student Table) */
      .cover-page {
        width: 100%;
        height: 100vh;
        page-break-after: always;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 40px 20px;
        text-align: center;
      }
      .cover-title-label {
        font-size: 13pt;
        font-weight: bold;
        letter-spacing: 2px;
        color: #222;
        margin-bottom: 24px;
        text-transform: uppercase;
      }
      .cover-title {
        font-size: 20pt;
        font-weight: bold;
        line-height: 1.35;
        max-width: 650px;
        color: #000;
        margin-bottom: 90px;
        text-transform: uppercase;
      }
      .cover-student-box {
        width: 100%;
        max-width: 580px;
        margin-top: 30px;
        text-align: left;
      }
      .cover-student-heading {
        font-size: 13pt;
        font-weight: bold;
        margin-bottom: 14px;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        text-align: center;
        border-bottom: 1.5px solid #000;
        padding-bottom: 6px;
      }
      .student-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11pt;
      }
      .student-table th, .student-table td {
        border: 1.5px solid #000;
        padding: 14px 18px;
      }
      .student-table th {
        background: #f2f2f2;
        font-weight: bold;
        text-align: center;
      }
      .student-table td {
        height: 52px;
        vertical-align: middle;
      }

      /* Content Styling */
      .section-container {
        margin-bottom: 24px;
      }
      .section-break {
        page-break-before: always;
      }
      h1.section-title {
        font-size: 14pt;
        font-weight: bold;
        text-transform: uppercase;
        border-bottom: 1.5px solid #000;
        padding-bottom: 4px;
        margin-top: 0;
        margin-bottom: 12px;
      }
      h2.sub-title {
        font-size: 12pt;
        font-weight: bold;
        margin-top: 14px;
        margin-bottom: 6px;
        color: #000;
      }
      p {
        margin: 0 0 10px 0;
        text-align: justify;
      }
      ul, ol {
        margin: 0 0 10px 22px;
        padding: 0;
      }
      li {
        margin-bottom: 4px;
        text-align: justify;
      }
      table.data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 9.5pt;
        margin: 10px 0 16px 0;
      }
      table.data-table th, table.data-table td {
        border: 1px solid #333;
        padding: 6px 8px;
      }
      table.data-table th {
        background: #f0f0f0;
        font-weight: bold;
        text-align: center;
      }
      .figure-box {
        margin: 12px 0 18px 0;
        text-align: center;
        page-break-inside: avoid;
      }
      .figure-img {
        width: 100%;
        max-width: 680px;
        max-height: 380px;
        object-fit: contain;
        border: 1px solid #888;
        border-radius: 4px;
        display: block;
        margin: 0 auto;
        box-shadow: 0 2px 4px rgba(0,0,0,0.12);
      }
      .figure-caption {
        font-size: 9.5pt;
        font-weight: bold;
        font-style: italic;
        margin-top: 6px;
        color: #111;
        text-align: center;
      }
      .code-formula {
        background: #f8fafc;
        border-left: 3px solid #0284c7;
        padding: 10px 14px;
        font-family: Consolas, monospace;
        font-size: 10pt;
        margin: 10px 0;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>

    <!-- 1. PDF FRONT PAGE -->
    <div class="cover-page">
      <div class="cover-title-label">Project Title</div>
      <div class="cover-title">
        AUTOMATED NETWORK BANDWIDTH BOTTLENECK DETECTION AND ALERT SYSTEM USING SNMP v1
      </div>

      <div class="cover-student-box">
        <div class="cover-student-heading">Student Details</div>
        <table class="student-table">
          <thead>
            <tr>
              <th style="width: 55%;">Student Name</th>
              <th style="width: 45%;">Register Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Student 1: __________________</td>
              <td>__________________</td>
            </tr>
            <tr>
              <td>Student 2: __________________</td>
              <td>__________________</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. CODING PROOF STARTS FROM PAGE 2 -->

    <!-- SECTION 1 -->
    <div class="section-container">
      <h1 class="section-title">Section 1: Project Description</h1>
      <p>
        The <strong>Automated Network Bandwidth Bottleneck Detection and Alert System Using SNMP v1</strong> is an interactive network telemetry, performance monitoring, and incident alerting platform engineered for the Network Design and Management (NDM) subject curriculum. The core objective of the project is to monitor interface traffic across enterprise network nodes (routers, aggregation switches, access switches, and production server clusters), calculate incoming and outgoing bandwidth utilization rates in real time, automatically detect bottlenecks against configured thresholds, and generate administrator alerts.
      </p>
      <p>
        The monitoring architecture is based on the <strong>Simple Network Management Protocol version 1 (SNMP v1)</strong> specified in <strong>RFC 1157</strong>. The system models the central SNMP Manager (NMS) issuing periodic polling requests over UDP port 161 to retrieve standardized <strong>MIB-II Interface Group</strong> objects (RFC 1213) from managed agents:
      </p>
      <ul>
        <li><code>ifSpeed</code> (OID 1.3.6.1.2.1.2.2.1.5): Nominal bandwidth capacity in bits per second.</li>
        <li><code>ifInOctets</code> (OID 1.3.6.1.2.1.2.2.1.10): Cumulative 32-bit counter of total incoming bytes received.</li>
        <li><code>ifOutOctets</code> (OID 1.3.6.1.2.1.2.2.1.16): Cumulative 32-bit counter of total outgoing bytes transmitted.</li>
      </ul>
      <p>
        To demonstrate the monitoring system reliably without requiring expensive physical routing hardware, the current implementation operates on a mathematically coherent synthetic dataset modeled after RFC 1213 counter increments. When bandwidth consumption crosses configured threshold limits (70% Warning, 85% Critical), the system automatically detects the bottleneck, elevates interface status, triggers audio-visual alarms, and provides a comprehensive administrator Problem Resolution workflow.
      </p>
    </div>

    <!-- SECTION 2 -->
    <div class="section-container section-break">
      <h1 class="section-title">Section 2: Project Architecture</h1>
      <p>
        The application is structured as a high-performance single-page application built with React 18, Vite 6, and Tailwind CSS. The system utilizes a centralized state provider (<code>NetworkContext.jsx</code>) to handle all telemetry polling, rate derivations, threshold checks, and alert management.
      </p>
      <h2 class="sub-title">Component Breakdown & Data Flow:</h2>
      <ul>
        <li><strong>Frontend Architecture:</strong> Modular component hierarchy comprising the Sidebar navigation, enterprise Header with quick simulation triggers, interactive KPI overview cards, Recharts bandwidth trend visualizations, and SVG network topology maps.</li>
        <li><strong>Telemetry & Polling Engine:</strong> Operates at configurable sampling intervals (Δt = 3 seconds by default). Calculates byte counter deltas between successive samples and derives bits-per-second rates.</li>
        <li><strong>Full-Duplex Evaluation Engine:</strong> Inbound and outbound streams are evaluated independently against interface capacity (<code>ifSpeed</code>) to guarantee that unidirectional saturation on full-duplex links is accurately detected.</li>
        <li><strong>Congestion Detection & Alert Dispatcher:</strong> Compares peak utilization against configured Warning (70%) and Critical (85%) limits. Automatically instantiates structured alert objects and updates notification badges and audio alarms.</li>
        <li><strong>Persistence:</strong> HTML5 LocalStorage stores incident logs, configured thresholds, and audio preferences across browser sessions.</li>
        <li><strong>Backend Note:</strong> The application uses its existing client-side telemetry engine and synthetic dataset. No separate backend server is required or fabricated.</li>
      </ul>

      <div class="figure-box">
        <img class="figure-img" src="${imgArch}" alt="System Architecture">
        <div class="figure-caption">Figure 1.1 – System Architecture and Data Processing Pipeline</div>
      </div>
    </div>

    <!-- SECTION 3 -->
    <div class="section-container section-break">
      <h1 class="section-title">Section 3: Dataset Generation and Structure</h1>
      <p>
        A synthetic network telemetry dataset was generated using <code>generate_dataset.py</code> and exported to <code>network_data.json</code> and <code>network_data.csv</code>. The dataset models 8 fictional network devices across 14 interfaces over sequential polling intervals.
      </p>
      <h2 class="sub-title">Required Dataset Columns:</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 17%;">Column Name</th>
            <th style="width: 15%;">MIB Equivalent</th>
            <th>Technical Description & Role in Bottleneck Detection</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>timestamp</code></td>
            <td>Poll Time</td>
            <td>Sampling timestamp of the telemetry reading (YYYY-MM-DD HH:MM:SS).</td>
          </tr>
          <tr>
            <td><code>device_name</code></td>
            <td>sysName</td>
            <td>Name of the monitored node (e.g., Main Router, Core Switch, Application Server).</td>
          </tr>
          <tr>
            <td><code>ip_address</code></td>
            <td>ipAdEntAddr</td>
            <td>Private management IP address of the device (e.g., 192.168.1.1).</td>
          </tr>
          <tr>
            <td><code>mac_address</code></td>
            <td>ifPhysAddress</td>
            <td>Fictional physical MAC address at the data link layer.</td>
          </tr>
          <tr>
            <td><code>interface_name</code></td>
            <td>ifDescr</td>
            <td>Interface port name (e.g., GigabitEthernet0/0 (WAN), FastEthernet0/1).</td>
          </tr>
          <tr>
            <td><code>ifSpeed</code></td>
            <td>ifSpeed (.1.5)</td>
            <td>Nominal interface capacity in bits per second (100 Mbps or 1 Gbps).</td>
          </tr>
          <tr>
            <td><code>ifInOctets</code></td>
            <td>ifInOctets (.1.10)</td>
            <td>Cumulative 32-bit byte counter of total incoming traffic since device boot.</td>
          </tr>
          <tr>
            <td><code>ifOutOctets</code></td>
            <td>ifOutOctets (.1.16)</td>
            <td>Cumulative 32-bit byte counter of total outgoing traffic since device boot.</td>
          </tr>
          <tr>
            <td><code>inbound_bps</code></td>
            <td>Derived Metric</td>
            <td>Calculated incoming throughput rate: ((current_ifInOctets - prev_ifInOctets) &times; 8) / Δt.</td>
          </tr>
          <tr>
            <td><code>outbound_bps</code></td>
            <td>Derived Metric</td>
            <td>Calculated outgoing throughput rate: ((current_ifOutOctets - prev_ifOutOctets) &times; 8) / Δt.</td>
          </tr>
          <tr>
            <td><code>inbound_utilization</code></td>
            <td>Derived Metric</td>
            <td>Percentage of incoming bandwidth capacity utilized: (inbound_bps / ifSpeed) &times; 100.</td>
          </tr>
          <tr>
            <td><code>outbound_utilization</code></td>
            <td>Derived Metric</td>
            <td>Percentage of outgoing bandwidth capacity utilized: (outbound_bps / ifSpeed) &times; 100.</td>
          </tr>
          <tr>
            <td><code>status</code></td>
            <td>Evaluated State</td>
            <td>Interface health classification: Normal (&lt;70%), Warning (70%–85%), or Critical (&ge;85%).</td>
          </tr>
        </tbody>
      </table>

      <h2 class="sub-title">Dataset Time Span and Records Summary:</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Dataset Metric</th>
            <th>Verified Project Value</th>
            <th>Technical Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Initial Reading Timestamp</td>
            <td>2026-11-17 10:00:00</td>
            <td>Start of baseline observation cycle.</td>
          </tr>
          <tr>
            <td>Final Reading Timestamp</td>
            <td>2026-11-17 10:03:30</td>
            <td>Conclusion of 15 observation intervals.</td>
          </tr>
          <tr>
            <td>Total Time Span Covered</td>
            <td>210 seconds (3.5 minutes)</td>
            <td>Covers baseline, traffic spikes, and recovery cycles.</td>
          </tr>
          <tr>
            <td>Total Dataset Records</td>
            <td>240 records</td>
            <td>15 time steps across 14 interfaces (14 &times; 15 = 210 + initial baselines).</td>
          </tr>
          <tr>
            <td>Number of Monitored Devices</td>
            <td>8 Network Devices</td>
            <td>1 Router, 5 Switches, 2 Enterprise Servers.</td>
          </tr>
          <tr>
            <td>Normal Traffic Records</td>
            <td>184 records (76.7%)</td>
            <td>Baseline healthy network traffic (&lt;70% utilization).</td>
          </tr>
          <tr>
            <td>Warning Traffic Records</td>
            <td>36 records (15.0%)</td>
            <td>Elevated traffic conditions crossing Warning threshold (70%–85%).</td>
          </tr>
          <tr>
            <td>Critical Traffic Records</td>
            <td>20 records (8.3%)</td>
            <td>Severe bottleneck saturation conditions exceeding Critical threshold (&ge;85%).</td>
          </tr>
        </tbody>
      </table>

      <div class="figure-box">
        <img class="figure-img" src="${imgJson}" alt="Dataset JSON Proof">
        <div class="figure-caption">Figure 2.1 – Generated Synthetic Telemetry Dataset in JSON Format (network_data.json)</div>
      </div>

      <div class="figure-box">
        <img class="figure-img" src="${imgCsv}" alt="Dataset CSV Proof">
        <div class="figure-caption">Figure 2.2 – Tabular Telemetry Dataset in CSV Format Showing Verified Cumulative Counters</div>
      </div>
    </div>

    <!-- SECTION 4 -->
    <div class="section-container section-break">
      <h1 class="section-title">Section 4: Frontend Implementation</h1>
      <p>
        The user interface provides operational pages built for network administrators. Every view connects to the shared telemetry engine and renders live metrics.
      </p>

      <h2 class="sub-title">1. Main Network Overview Dashboard</h2>
      <p>
        Displays aggregate network statistics, health scores, bandwidth trend charts, and immediate alert summaries.
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgDash}" alt="Dashboard Overview">
        <div class="figure-caption">Figure 3.1 – Main Network Overview Dashboard with Live Telemetry and Health Index</div>
      </div>

      <h2 class="sub-title">2. Bandwidth Monitoring Page</h2>
      <p>
        Provides granular interface-level inspection, inbound and outbound traffic trend graphs, full-duplex utilization bars, and OID references.
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgBw}" alt="Bandwidth Monitoring">
        <div class="figure-caption">Figure 3.2 – Bandwidth Monitoring Page Showing Inbound vs. Outbound Rates</div>
      </div>

      <h2 class="sub-title">3. Device Monitoring Matrix & Diagnostic Modal</h2>
      <p>
        Presents all 8 devices and 14 interfaces with live search and status filters. Clicking <em>Drilldown</em> opens the diagnostic modal.
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgDev}" alt="Device Monitoring Table">
        <div class="figure-caption">Figure 3.3 – Device Monitoring Table with Real-Time Interface Utilization Rates</div>
      </div>
      <div class="figure-box">
        <img class="figure-img" src="${imgDrill}" alt="Device Drilldown Modal">
        <div class="figure-caption">Figure 3.4 – Device Diagnostic Drilldown Modal for Core Switch Gigabit Ports</div>
      </div>

      <h2 class="sub-title">4. Network Topology & Supporting System Pages</h2>
      <p>
        Interactive topology map highlighting link congestion, 4-stage SNMP pipeline documentation, and administrator settings.
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgTopo}" alt="Network Topology">
        <div class="figure-caption">Figure 3.5 – Interactive SVG Network Topology with Dynamic Link Saturation Highlighting</div>
      </div>
      <div class="figure-box">
        <img class="figure-img" src="${imgHow}" alt="How It Works">
        <div class="figure-caption">Figure 3.6 – Visual Explanation of the 4-Stage SNMP Monitoring Pipeline (POLL-CALCULATE-DETECT-ALERT)</div>
      </div>
      <div class="figure-box">
        <img class="figure-img" src="${imgSet}" alt="Settings Page">
        <div class="figure-caption">Figure 3.7 – System Settings for Dynamic Threshold Configuration and Polling Intervals</div>
      </div>
    </div>

    <!-- SECTION 5 -->
    <div class="section-container section-break">
      <h1 class="section-title">Section 5: Source Code Proof</h1>
      <p>
        The following source code excerpts represent the core mathematical, polling, and alert management implementations from the actual codebase.
      </p>

      <h2 class="sub-title">A. Telemetry Processing & Bandwidth Calculation Logic</h2>
      <p>
        Implemented in <code>src/context/NetworkContext.jsx</code>, this code computes counter differences and derives throughput and utilization percentages.
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgCodeFormulas}" alt="Bandwidth Calculation Code">
        <div class="figure-caption">Figure 4.1 – Source Code Proof: Bandwidth Delta Rate and Utilization Calculation (NetworkContext.jsx)</div>
      </div>

      <h2 class="sub-title">B. Alert Generation & Problem Resolution Dispatch</h2>
      <p>
        Demonstrates the synchronous alert generation, threshold evaluation, and administrator problem resolution handling.
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgCodeAlert}" alt="Alert Generation Code">
        <div class="figure-caption">Figure 4.2 – Source Code Proof: Alert Object Construction and Incident Dispatch (NetworkContext.jsx)</div>
      </div>

      <h2 class="sub-title">C. Synthetic Dataset Mathematical Generator</h2>
      <p>
        Python implementation in <code>generate_dataset.py</code> that models cumulative counter increments based on interface speeds.
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgCodePy}" alt="Python Generator Code">
        <div class="figure-caption">Figure 4.3 – Source Code Proof: Mathematical Counter Increment Modeling (generate_dataset.py)</div>
      </div>
    </div>

    <!-- SECTION 6 -->
    <div class="section-container section-break">
      <h1 class="section-title">Section 6: Bandwidth Monitoring Output</h1>
      <p>
        In modern switched full-duplex Ethernet networks, transmit (Tx) and receive (Rx) wire pairs function independently without collision. A core achievement of this project is avoiding the common fallacy of summing inbound and outbound traffic into a single combined percentage.
      </p>
      <h2 class="sub-title">SNMP v1 Mathematical Counter Formulas:</h2>
      <div class="code-formula">
        Inbound Traffic Rate (bps) = ((current_ifInOctets - previous_ifInOctets) &times; 8) / Time_Difference_Seconds<br><br>
        Outbound Traffic Rate (bps) = ((current_ifOutOctets - previous_ifOutOctets) &times; 8) / Time_Difference_Seconds<br><br>
        Inbound Utilization (%) = (Inbound_bps / ifSpeed) &times; 100<br><br>
        Outbound Utilization (%) = (Outbound_bps / ifSpeed) &times; 100<br><br>
        Peak Interface Utilization = max(Inbound_Utilization, Outbound_Utilization)
      </div>
      <p>
        Multiplying octet differences by 8 converts bytes to bits. Dividing by the elapsed polling interval (Δt = 3 seconds by default) yields instantaneous bits per second. The peak channel utilization is evaluated against administrator threshold bands.
      </p>
    </div>

    <!-- SECTION 7 -->
    <div class="section-container section-break">
      <h1 class="section-title">Section 7: Congestion Detection and Alert Output</h1>
      <p>
        The system provides 4 interactive simulation triggers: <em>Normal Traffic</em>, <em>Trigger Warning</em>, <em>Trigger Critical Congestion</em>, and <em>Reset Simulation</em>. The following screenshots capture the actual application outputs across all three operational conditions.
      </p>

      <h2 class="sub-title">A. Normal Operational Condition (&lt; 70% Utilization)</h2>
      <p>
        All 8 network devices and 14 interfaces operate within normal limits (typically 20% to 45% utilization). Interface statuses display green, the Network Health Score is 100, and zero active alerts exist.
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgNorm}" alt="Normal Condition">
        <div class="figure-caption">Figure 5.1 – Congestion Detection in Normal Operational Condition (&lt;70% Capacity)</div>
      </div>

      <h2 class="sub-title">B. Warning Traffic Condition (70% &le; Utilization &lt; 85%)</h2>
      <p>
        Triggering the Warning condition increases traffic across the Core Switch trunk to Distribution Switch 01, reaching ~78% utilization. The interface status turns amber, an automated Warning alert is generated, and a two-tone alert chime sounds.
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgWarn}" alt="Warning Condition">
        <div class="figure-caption">Figure 5.2 – Congestion Detection in Warning Condition (Core Switch Trunk Reaches 78% Utilization)</div>
      </div>
      <div class="figure-box">
        <img class="figure-img" src="${imgAlertWarn}" alt="Warning Alert">
        <div class="figure-caption">Figure 5.3 – Automated Warning Alert Staged in Alert Management Queue with Orange Indicator</div>
      </div>

      <h2 class="sub-title">C. Critical Bottleneck Condition (&ge; 85% Utilization)</h2>
      <p>
        Triggering Critical Congestion simulates an extreme traffic surge on the Main Router WAN interface (GigabitEthernet0/0), driving outbound utilization to 93%. The system immediately flags a severe bottleneck, turns the interface status red, displays a prominent emergency banner, and activates an urgency alarm.
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgCrit}" alt="Critical Condition">
        <div class="figure-caption">Figure 5.4 – Critical Bottleneck Congestion Output (Main Router WAN Reaches 93% Saturation)</div>
      </div>
    </div>

    <!-- SECTION 8 -->
    <div class="section-container section-break">
      <h1 class="section-title">Section 8: Alert Management and Problem Resolution</h1>
      <p>
        The Alert Management module provides an administrator workflow for incident response, problem verification, and historical auditing.
      </p>

      <h2 class="sub-title">1. Active Critical Alert with Problem Resolution Decision</h2>
      <p>
        For every active Critical alert, the dashboard presents comprehensive telemetry along with the required administrative decision question: <strong>"Has this network problem been resolved?"</strong>
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgAlertAct}" alt="Alert Management Active">
        <div class="figure-caption">Figure 6.1 – Active Critical Alert Queue Displaying the Administrator Problem Resolution Question</div>
      </div>

      <h2 class="sub-title">2. Administrator Selects "NO - Problem Not Resolved"</h2>
      <p>
        When the administrator clicks <em>NO - Problem Not Resolved</em>, the system preserves the Critical status, displays a prominent <strong>"Problem Not Resolved"</strong> indicator, and continues monitoring live bandwidth usage without prematurely resetting the interface.
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgProbNo}" alt="Problem Not Resolved">
        <div class="figure-caption">Figure 6.2 – Problem Not Resolved Status: Alert Preserved as Critical While Investigation Continues</div>
      </div>

      <h2 class="sub-title">3. Administrator Selects "YES - Problem Resolved" & Telemetry Guard</h2>
      <p>
        When the administrator clicks <em>YES - Problem Resolved</em>, the incident moves to the <strong>Resolved Alerts</strong> section with its resolution timestamp recorded. Importantly, if the underlying simulation traffic remains elevated, the system does not falsely mark the interface Normal; instead, it displays: <em>"Resolution acknowledged, but high bandwidth usage is still detected. Monitoring continues."</em>
      </p>
      <div class="figure-box">
        <img class="figure-img" src="${imgProbYes}" alt="Problem Resolved History">
        <div class="figure-caption">Figure 6.3 – Resolved Alerts Audit History with Resolution Timestamps and Telemetry Continuity Guard</div>
      </div>
    </div>

    <!-- SECTION 9 -->
    <div class="section-container section-break">
      <h1 class="section-title">Section 9: Final Results and Academic Conclusion</h1>
      <h2 class="sub-title">Project Verification Summary:</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 28%;">Requirement / Deliverable</th>
            <th style="width: 18%;">Status</th>
            <th>Verified Operational Implementation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Synthetic SNMP Dataset</td>
            <td>Verified & Complete</td>
            <td>240 records across 8 devices, 14 interfaces, exported in JSON and CSV.</td>
          </tr>
          <tr>
            <td>SNMP v1 MIB-II Modeling</td>
            <td>Verified & Complete</td>
            <td>Accurately implements ifSpeed, ifInOctets, and ifOutOctets OIDs.</td>
          </tr>
          <tr>
            <td>Bandwidth Delta Calculations</td>
            <td>Verified & Complete</td>
            <td>Bit rates re-calculated strictly from counter differences: (ΔOctets &times; 8) / Δt.</td>
          </tr>
          <tr>
            <td>Full-Duplex Evaluation</td>
            <td>Verified & Complete</td>
            <td>Inbound and outbound channels evaluated separately against interface capacity.</td>
          </tr>
          <tr>
            <td>Congestion Detection Triggers</td>
            <td>Verified & Complete</td>
            <td>Working simulation buttons for Normal, Warning, Critical, and Reset.</td>
          </tr>
          <tr>
            <td>Administrator Incident Alerting</td>
            <td>Verified & Complete</td>
            <td>On-screen banners, navigation badges, and Web Audio API tone synthesis.</td>
          </tr>
          <tr>
            <td>Problem Resolution Workflow</td>
            <td>Verified & Complete</td>
            <td>YES/NO resolution decision with continuous bandwidth telemetry protection.</td>
          </tr>
          <tr>
            <td>Audit Trail & Persistence</td>
            <td>Verified & Complete</td>
            <td>Incident logs and configuration persist across reloads via HTML5 LocalStorage.</td>
          </tr>
        </tbody>
      </table>

      <h2 class="sub-title">Conclusion</h2>
      <p>
        The <em>Automated Network Bandwidth Bottleneck Detection and Alert System Using SNMP v1</em> successfully demonstrates the practical application of network management protocols to solve infrastructure congestion challenges. By shifting from reactive incident response to automated, continuous, counter-based telemetry analysis, the system enables network administrators to pinpoint saturated interface queues, prevent catastrophic packet drops, and maintain optimal network availability. The implementation fulfills all academic and functional criteria established for the Network Design and Management project curriculum.
      </p>
    </div>

  </body>
  </html>
  `;

  // Write HTML file for debugging / editable source document
  fs.writeFileSync('Coding_Proof_Document.html', htmlContent, 'utf8');

  // Launch Puppeteer to render initial raw PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const rawPdfPath = path.resolve('raw_document.pdf');
  await page.pdf({
    path: rawPdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false, // We will stamp the running header/footer using Python ReportLab
    margin: {
      top: '20mm',
      bottom: '22mm',
      left: '18mm',
      right: '18mm'
    }
  });

  await browser.close();
  console.log('--- Raw PDF Rendered. Stamping Headers, Footers & Cover Page ---');
}

buildPdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
