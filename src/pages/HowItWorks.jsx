import React, { useState } from 'react';
import {
  BookOpen,
  Radio,
  Calculator,
  Search,
  Bell,
  Layers,
  Server,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Terminal,
  Info
} from 'lucide-react';

const STAGES = [
  {
    step: 1,
    title: 'POLL',
    name: 'SNMP Data Collection',
    icon: Radio,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-950/20',
    summary: 'The central SNMP Manager issues periodic SNMP GET requests (UDP Port 161) to each SNMP Agent running on routers, switches, and servers.',
    details: [
      'Queries RFC 1213 MIB-II Interface Group OIDs.',
      'Retrieves ifSpeed (OID 1.3.6.1.2.1.2.2.1.5) for nominal capacity in bps.',
      'Retrieves ifInOctets (OID 1.3.6.1.2.1.2.2.1.10) for cumulative bytes received.',
      'Retrieves ifOutOctets (OID 1.3.6.1.2.1.2.2.1.16) for cumulative bytes sent.',
      'Standard polling interval Δt is typically 3 to 15 seconds.'
    ]
  },
  {
    step: 2,
    title: 'CALCULATE',
    name: 'Bandwidth Rate Computation',
    icon: Calculator,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-950/20',
    summary: 'Because SNMP v1 counters are cumulative octets, the system computes bit rates from consecutive readings across time delta Δt.',
    details: [
      'Inbound Traffic: inbound_bps = (current_ifInOctets - previous_ifInOctets) * 8 / Δt',
      'Outbound Traffic: outbound_bps = (current_ifOutOctets - previous_ifOutOctets) * 8 / Δt',
      'Inbound Utilization: (inbound_bps / ifSpeed) * 100',
      'Outbound Utilization: (outbound_bps / ifSpeed) * 100',
      'Full-Duplex Evaluation: Inbound and Outbound channels are evaluated independently (not summed together).'
    ]
  },
  {
    step: 3,
    title: 'DETECT',
    name: 'Bottleneck Threshold Evaluation',
    icon: Search,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-950/20',
    summary: 'Calculated channel utilization percentages are tested against administrator-configured threshold bands.',
    details: [
      'Normal Status: Utilization < 70% (Smooth packet delivery within buffer capacity).',
      'Warning Status: 70% ≤ Utilization < 85% (Approaching line rate; buffer queues expanding).',
      'Critical Bottleneck: Utilization ≥ 85% (Interface saturation; impending tail-drop packet loss and latency spikes).',
      'Automatic state transition tracking to identify highest-congestion interface.'
    ]
  },
  {
    step: 4,
    title: 'ALERT',
    name: 'Administrator Notification',
    icon: Bell,
    color: 'text-red-400',
    borderColor: 'border-red-500/40',
    bgColor: 'bg-red-950/20',
    summary: 'When a threshold is breached, an immutable incident record is generated and dispatched to the administrator.',
    details: [
      'Generates unique Alert ID, timestamp, device name, IP address, affected interface, and peak utilization %.',
      'Triggers immediate on-screen notification banner and visual navigation badge.',
      'Synthesizes local Web Audio API tone (urgent siren for Critical, two-tone chime for Warning).',
      'Persists incident in LocalStorage alert history for post-incident root-cause analysis.',
      'Supports administrator Acknowledge and Resolve workflow.'
    ]
  }
];

export default function HowItWorks() {
  const [activeStage, setActiveStage] = useState(1);

  return (
    <div className="p-6 space-y-6">
      {/* 4 Stage Interactive Stepper */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>The 4-Stage Automated Monitoring & Bottleneck Detection Pipeline</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click on any phase to inspect the protocol exchange, mathematical formulas, and detection logic.
          </p>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STAGES.map(stage => {
            const Icon = stage.icon;
            const isCurrent = activeStage === stage.step;

            return (
              <button
                key={stage.step}
                onClick={() => setActiveStage(stage.step)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? `${stage.bgColor} ${stage.borderColor} ring-2 ring-cyan-500/30 shadow-lg`
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-mono font-bold uppercase ${stage.color}`}>
                    Stage {stage.step}: {stage.title}
                  </span>
                  <Icon className={`w-4 h-4 ${stage.color}`} />
                </div>
                <div className="text-xs font-bold text-slate-200">{stage.name}</div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed View */}
        {(() => {
          const curr = STAGES.find(s => s.step === activeStage);
          if (!curr) return null;
          const Icon = curr.icon;

          return (
            <div className={`p-6 rounded-xl border ${curr.borderColor} ${curr.bgColor} space-y-4`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-slate-900 border border-slate-700 ${curr.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase text-slate-400">Phase {curr.step} Deep-Dive</div>
                  <h4 className="text-base font-bold text-slate-100">{curr.name}</h4>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {curr.summary}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">
                  Technical Specifications & Protocol Rules:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {curr.details.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })()}
      </div>

      {/* SNMP Core Concepts: Manager, Agent, and MIB */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>SNMP v1 Architecture: Manager, Agent, and MIB</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Server className="w-4 h-4" />
              <span>1. SNMP Manager</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              The centralized network management station (NMS) executing the polling loop. It initiates UDP datagrams containing <code>GetRequest-PDU</code> payloads directed to UDP port 161 on network nodes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <Radio className="w-4 h-4" />
              <span>2. SNMP Agent</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Software daemon running natively on routers, switches, and servers. Upon receiving an authenticated SNMP request (community string match), it inspects kernel interface counters and returns a <code>GetResponse-PDU</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Layers className="w-4 h-4" />
              <span>3. MIB (Management Info Base)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              A hierarchical tree of managed objects defined by RFC 1213. Interfaces are indexed under <code>iso.org.dod.internet.mgmt.mib-2.interfaces</code> (1.3.6.1.2.1.2), providing uniform vendor-neutral telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Mode vs Physical SNMP Future Roadmap */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Info className="w-4 h-4" />
          <h3 className="text-sm font-bold text-slate-100">
            System Operating Modes: Simulation vs. Physical Deployment
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-cyan-300 font-bold">Mode 1: Simulated SNMP Monitoring (Current)</strong>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">ACTIVE</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">
              Operates deterministically using the generated <code>network_data.json</code> and mathematical delta calculations. Simulates 8 enterprise devices with realistic traffic spikes, warning conditions, and critical bottleneck saturations without requiring physical hardware.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-slate-200 font-bold">Mode 2: Physical SNMP Connectivity (Future Extension)</strong>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">ROADMAP</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-sans">
              Optional backend service (e.g. Python FastSNMP daemon using <code>pysnmp</code>) configured with target IP addresses and SNMP community strings to dispatch raw UDP SNMP GET requests to physical Cisco/Juniper hardware in a laboratory environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
