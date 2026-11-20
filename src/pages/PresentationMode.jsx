import React, { useState } from 'react';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Layers,
  Server,
  Bell,
  RotateCcw,
  Volume2,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';

const PRESENTATION_STEPS = [
  {
    step: 1,
    title: '1. Project Introduction & Objective',
    subtitle: 'Automated Network Bandwidth Bottleneck Detection and Alert System Using SNMP v1',
    subject: 'Network Design and Management (NDM)',
    summary: 'Demonstrating automated interface-level traffic monitoring, byte-counter rate calculation, congestion detection, and administrator incident alerting.',
    talkingPoints: [
      'Problem Statement: Network congestion leads to queue buffer bloat, packet tail-drop, increased jitter, and application failure.',
      'Proposed Solution: An automated SNMP v1 telemetry engine that continuously polls MIB-II interface counters and detects impending bottlenecks before outages occur.',
      'Full-Duplex Evaluation: Inbound and outbound traffic streams are evaluated separately to avoid misleading aggregate averages.',
      'Target Demo Flow: A 5-minute defense covering normal operations, warning alerts, critical bottlenecks, and resolution.'
    ],
    highlight: 'Core Goal: When bandwidth usage increases beyond the configured threshold, the system automatically flags the interface, generates an alert, and notifies the administrator.'
  },
  {
    step: 2,
    title: '2. SNMP v1 Architecture & MIB Structure',
    subtitle: 'RFC 1157 SNMP Protocol & RFC 1213 MIB-II Interface Group',
    subject: 'Protocol Engineering',
    summary: 'Explanation of how the SNMP Manager, SNMP Agent, and Management Information Base interact.',
    talkingPoints: [
      'SNMP Manager: The network management station issuing periodic SNMP GET requests across UDP Port 161.',
      'SNMP Agent: Device software maintaining 32-bit cumulative counters in kernel space.',
      'MIB-II Interface Group OIDs utilized:',
      '• ifSpeed (1.3.6.1.2.1.2.2.1.5): Nominal interface capacity in bps (e.g. 100M or 1G).',
      '• ifInOctets (1.3.6.1.2.1.2.2.1.10): Cumulative incoming octets (bytes) received.',
      '• ifOutOctets (1.3.6.1.2.1.2.2.1.16): Cumulative outgoing octets (bytes) transmitted.'
    ],
    highlight: 'Key Calculation: Bandwidth rate is derived mathematically: Rate_bps = (Current_Octets - Previous_Octets) * 8 / Delta_Time.'
  },
  {
    step: 3,
    title: '3. Network Devices Being Monitored',
    subtitle: 'Enterprise 8-Device Core-Distribution-Access Topology',
    subject: 'Infrastructure Design',
    summary: 'Hierarchical campus network architecture spanning gateway router, switches, and production servers.',
    talkingPoints: [
      '1. Main Router (192.168.1.1): WAN optical connection (100 Mbps) & LAN core trunk (1 Gbps).',
      '2. Core Switch (192.168.1.2): Central gigabit aggregation backbone.',
      '3. Distribution Switch 01 & 02 (192.168.1.3 - 4): Building distribution trunks.',
      '4. Access Switch 01 & 02 (192.168.1.5 - 6): Edge wiring closet switches.',
      '5. Application Server (192.168.1.50): Web server & secondary backup trunk.',
      '6. Database Server (192.168.1.60): Primary PostgreSQL database cluster.'
    ],
    highlight: 'Real-world fidelity: Devices use realistic private IP addressing, fictional MAC addresses, and interface designations (GigabitEthernet, FastEthernet, eth0).'
  },
  {
    step: 4,
    title: '4. Bandwidth Monitoring & Rate Formulas',
    subtitle: 'Mathematically Rigorous Delta Computation',
    subject: 'Mathematical Telemetry',
    summary: 'Deriving throughput from consecutive cumulative counter readings without relying on pre-baked rate figures.',
    talkingPoints: [
      'Step 1: Record previous counter and timestamp (t0, octets0).',
      'Step 2: Collect current counter and timestamp (t1, octets1).',
      'Step 3: Calculate Delta_t = t1 - t0 in seconds.',
      'Step 4: Inbound_bps = (current_ifInOctets - prev_ifInOctets) * 8 / Delta_t.',
      'Step 5: Outbound_bps = (current_ifOutOctets - prev_ifOutOctets) * 8 / Delta_t.',
      'Step 6: Utilization% = (Calculated_bps / ifSpeed) * 100.'
    ],
    highlight: 'Important: We evaluate inbound and outbound utilization independently. Adding them together for a full-duplex link is mathematically incorrect.'
  },
  {
    step: 5,
    title: '5. Normal Traffic Condition (Demonstration)',
    subtitle: 'Baseline Campus Network Operations (< 70% Utilization)',
    subject: 'Live Demonstration Step 1',
    summary: 'Observe the network running smoothly under regular operational load.',
    talkingPoints: [
      'In normal mode, all interface utilizations fluctuate between 15% and 45%.',
      'Switch packet buffers have ample headroom with zero packet drops.',
      'Network health score sits at optimal level (95 - 100).',
      'Zero warning or critical alerts are generated.'
    ],
    highlight: 'Action: Click "Apply Normal Traffic" below to observe healthy green telemetry indicators across all 8 devices.'
  },
  {
    step: 6,
    title: '6. Warning Traffic Condition (Demonstration)',
    subtitle: 'Elevated Load Approaching Interface Capacity (70% - 85%)',
    subject: 'Live Demonstration Step 2',
    summary: 'Simulate a traffic spike on Core Switch Trunk to Dist-01 crossing the 70% Warning threshold.',
    talkingPoints: [
      'Core Switch Trunk to Dist-01 experiences elevated transfer load, reaching ~78% utilization.',
      'The automated detection engine immediately identifies the affected interface.',
      'Interface status transitions from Normal (green) to Warning (amber).',
      'A Warning alert is automatically staged in the alert history.',
      'A two-tone warning chime sounds through Web Audio API.'
    ],
    highlight: 'Action: Click "Trigger Warning Traffic" below and observe the automatic status escalation and alert creation.'
  },
  {
    step: 7,
    title: '7. Critical Congestion Condition (Demonstration)',
    subtitle: 'Severe Interface Bottleneck Saturation (≥ 85% Utilization)',
    subject: 'Live Demonstration Step 3',
    summary: 'Simulate severe bottleneck congestion on Main Router WAN and Application Server backup trunk reaching ~93%.',
    talkingPoints: [
      'Main Router WAN interface (GigabitEthernet0/0) spikes to 93% saturation.',
      'Status transitions instantly to Critical (red flashing indicator).',
      'An emergency on-screen alert banner appears across the dashboard.',
      'The navigation badge highlights urgent pending administrator action.',
      'An urgent dual-tone siren is synthesized for the network operator.'
    ],
    highlight: 'Action: Click "Trigger Critical Bottleneck" below to witness emergency bottleneck alert generation.'
  },
  {
    step: 8,
    title: '8. Administrator Alert Lifecycle',
    subtitle: 'Incident Response: Acknowledgment and Resolution',
    subject: 'Incident Management',
    summary: 'Demonstrating how the network administrator manages and documents active network incidents.',
    talkingPoints: [
      'Each alert captures: Alert ID, Timestamp, Device Name, IP Address, Interface, Peak Utilization, and Diagnostic Description.',
      'Step 1: Administrator clicks "Acknowledge" to claim the incident and cease escalation.',
      'Step 2: Administrator investigates the affected interface via diagnostic drilldowns.',
      'Step 3: After remediation or traffic normalization, administrator marks the alert "Resolved".'
    ],
    highlight: 'Action: Use the inline buttons below to Acknowledge and Resolve the active incident, demonstrating complete operational lifecycle.'
  },
  {
    step: 9,
    title: '9. Alert History & LocalStorage Persistence',
    subtitle: 'Audit Trail and Forensic Analysis',
    subject: 'Operational Governance',
    summary: 'Alert records persist locally across browser sessions for auditing and SLA compliance.',
    talkingPoints: [
      'Alert history is preserved in browser LocalStorage (`ndm_snmp_alerts`).',
      'Refreshing the browser does NOT erase incident logs or user settings.',
      'Deduplication safeguard: Engine does not spam identical alerts every 3 seconds for continuous congestion; it alerts once on threshold breach.',
      'Administrator has the option to filter by severity or clear resolved incidents.'
    ],
    highlight: 'Faculty Check: You can refresh this browser page anytime; all alerts and threshold settings will remain intact.'
  },
  {
    step: 10,
    title: '10. Project Conclusion & Future Work',
    subtitle: 'Summary of Academic Deliverables and Real-World Extensibility',
    subject: 'Academic Defense Summary',
    summary: 'Concluding the presentation with a recap of achievements and physical deployment roadmap.',
    talkingPoints: [
      'Summary: Successfully developed an automated network bandwidth bottleneck detection and alerting system using SNMP v1 concepts.',
      'Implemented genuine MIB-II counter delta formulas for full-duplex traffic.',
      'Designed responsive enterprise dark UI with charts, topology, and 100% working buttons.',
      'Created comprehensive synthetic dataset (JSON & CSV) and documentation.',
      'Future Extension: Integrating a physical SNMP daemon (Python `pysnmp` / `net-snmp`) to query physical lab hardware.'
    ],
    highlight: 'Conclusion: The system fulfills all Network Design and Management project requirements. Thank you to the faculty committee.'
  }
];

export default function PresentationMode({ setCurrentPage }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const {
    metrics,
    simulationMode,
    applySimulationMode,
    resetSimulation,
    alerts,
    acknowledgeAlert,
    resolveAlert
  } = useNetwork();

  const step = PRESENTATION_STEPS[currentStepIdx];
  const isFirst = currentStepIdx === 0;
  const isLast = currentStepIdx === PRESENTATION_STEPS.length - 1;

  const activeAlert = alerts[0];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Presentation Top Navigation & Progress */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                NDM Faculty Presentation
              </span>
              <h2 className="text-base font-bold text-slate-100">
                Step {step.step} of {PRESENTATION_STEPS.length}: {step.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentStepIdx(p => Math.max(0, p - 1))}
              disabled={isFirst}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-all flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentStepIdx(p => Math.min(PRESENTATION_STEPS.length - 1, p + 1))}
              disabled={isLast}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-xs font-bold text-white transition-all flex items-center space-x-1 shadow-md shadow-indigo-600/30"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="grid grid-cols-10 gap-1.5 pt-2 border-t border-slate-800/80">
          {PRESENTATION_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStepIdx(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStepIdx
                  ? 'bg-indigo-500 shadow-sm shadow-indigo-500'
                  : idx < currentStepIdx
                  ? 'bg-emerald-500/80'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-[#0e1629] border-2 border-indigo-500/40 shadow-2xl space-y-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold block">
            {step.subject}
          </span>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-1">
            {step.title}
          </h3>
          <p className="text-sm font-medium text-slate-300 mt-1">
            {step.subtitle}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans">
          {step.summary}
        </div>

        {/* Faculty Talking Points */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
            Key Defense & Technical Discussion Points:
          </h4>
          <div className="space-y-2.5">
            {step.talkingPoints.map((point, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highlight Callout Box */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-xs sm:text-sm text-indigo-200 font-medium flex items-center space-x-3">
          <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>{step.highlight}</span>
        </div>

        {/* Interactive Action Widget embedded for specific demonstration slides */}
        {step.step === 5 && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3">
            <span className="text-xs font-mono uppercase text-emerald-400 font-bold block">
              Live Demonstration Action:
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => applySimulationMode('normal')}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Normal Traffic Conditions</span>
              </button>
              <span className="text-xs text-slate-400">
                Current Mode: <strong className="text-emerald-400 uppercase font-mono">{simulationMode}</strong>
              </span>
            </div>
          </div>
        )}

        {step.step === 6 && (
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
            <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
              Live Demonstration Action:
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => applySimulationMode('warning')}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Trigger Warning Traffic Spike</span>
              </button>
              <span className="text-xs text-slate-400">
                Current Mode: <strong className="text-amber-400 uppercase font-mono">{simulationMode}</strong>
              </span>
            </div>
          </div>
        )}

        {step.step === 7 && (
          <div className="p-4 rounded-xl bg-slate-950 border border-red-500/40 space-y-3">
            <span className="text-xs font-mono uppercase text-red-400 font-bold block">
              Live Demonstration Action:
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => applySimulationMode('critical')}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2 animate-pulse"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Trigger Critical Congestion Bottleneck</span>
              </button>
              <span className="text-xs text-slate-400">
                Current Mode: <strong className="text-red-400 uppercase font-mono">{simulationMode}</strong>
              </span>
            </div>
          </div>
        )}

        {step.step === 8 && activeAlert && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 space-y-3">
            <span className="text-xs font-mono uppercase text-cyan-400 font-bold block">
              Simulate Administrator Incident Handling:
            </span>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-cyan-400 font-bold">{activeAlert.id}</span>
                <span className={activeAlert.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'}>
                  {activeAlert.severity} ({activeAlert.utilization}%)
                </span>
              </div>
              <p className="text-slate-300 font-sans">{activeAlert.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              {activeAlert.status === 'Active' && (
                <button
                  onClick={() => acknowledgeAlert(activeAlert.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  Acknowledge Incident
                </button>
              )}
              {activeAlert.status !== 'Resolved' && (
                <button
                  onClick={() => resolveAlert(activeAlert.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm"
                >
                  Resolve Incident
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={() => setCurrentPage('overview')}
          className="flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Exit Presentation & Return to Live Dashboard</span>
        </button>

        <div className="font-mono">
          Slide {step.step} of 10
        </div>
      </div>
    </div>
  );
}
