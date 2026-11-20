import React, { useMemo } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  RotateCcw,
  Activity,
  Flame,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Zap
} from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';

function formatBits(bps) {
  if (bps >= 1_000_000_000) return `${(bps / 1_000_000_000).toFixed(2)} Gbps`;
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(2)} Kbps`;
  return `${bps} bps`;
}

export default function CongestionDetection({ setCurrentPage }) {
  const {
    telemetry,
    thresholds,
    simulationMode,
    applySimulationMode,
    resetSimulation,
    setSelectedDeviceModal
  } = useNetwork();

  // Find all congested interfaces (status === 'Warning' || status === 'Critical')
  const congestedInterfaces = useMemo(() => {
    const list = [];
    Object.values(telemetry).forEach(dev => {
      dev.interfaces.forEach(iface => {
        const maxUtil = Math.max(iface.inbound_utilization, iface.outbound_utilization);
        if (maxUtil >= thresholds.warning) {
          list.push({
            device: dev,
            iface,
            maxUtil,
            direction: iface.inbound_utilization >= iface.outbound_utilization ? 'Inbound' : 'Outbound',
            severity: maxUtil >= thresholds.critical ? 'Critical' : 'Warning',
            status: iface.status,
            detectedAt: iface.lastUpdated
          });
        }
      });
    });
    // Sort descending by utilization
    return list.sort((a, b) => b.maxUtil - a.maxUtil);
  }, [telemetry, thresholds]);

  return (
    <div className="p-6 space-y-6">
      {/* Simulation Command Center Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">
                Interactive Bottleneck Simulation Controls
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select a scenario below to dynamically alter interface cumulative counters and observe automated SNMP threshold evaluation.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-400">Current Mode:</span>
            <span className={`px-2.5 py-1 rounded font-bold uppercase ${
              simulationMode === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' :
              simulationMode === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {simulationMode} Traffic State
            </span>
          </div>
        </div>

        {/* 4 Required Functional Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Button 1: Normal Traffic */}
          <button
            onClick={() => applySimulationMode('normal')}
            className={`p-3 rounded-xl border flex items-center space-x-3 transition-all ${
              simulationMode === 'normal'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold font-sans">1. Normal Traffic</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">&lt; {thresholds.warning}% baseline load</div>
            </div>
          </button>

          {/* Button 2: Trigger Warning */}
          <button
            onClick={() => applySimulationMode('warning')}
            className={`p-3 rounded-xl border flex items-center space-x-3 transition-all ${
              simulationMode === 'warning'
                ? 'bg-amber-600/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold font-sans">2. Trigger Warning</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{thresholds.warning}% - {thresholds.critical}% traffic spike</div>
            </div>
          </button>

          {/* Button 3: Trigger Critical Congestion */}
          <button
            onClick={() => applySimulationMode('critical')}
            className={`p-3 rounded-xl border flex items-center space-x-3 transition-all ${
              simulationMode === 'critical'
                ? 'bg-red-600/20 border-red-500 text-red-300 ring-2 ring-red-500/30 animate-pulse-subtle'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold font-sans">3. Trigger Critical</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">&gt;= {thresholds.critical}% bottleneck saturation</div>
            </div>
          </button>

          {/* Button 4: Reset Simulation */}
          <button
            onClick={resetSimulation}
            className="p-3 rounded-xl border bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-cyan-500/50 hover:text-cyan-400 flex items-center space-x-3 transition-all"
          >
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold font-sans">4. Reset Simulation</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Flush states to normal</div>
            </div>
          </button>
        </div>
      </div>

      {/* Threshold Status & Visual Indicator Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configured Thresholds Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h4 className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            <span>Detection Thresholds</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </h4>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/30 flex justify-between items-center">
              <div>
                <span className="text-emerald-400 font-bold block">Normal Band</span>
                <span className="text-[10px] text-slate-400 font-sans">Acceptable queue headroom</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm">0% — {thresholds.warning - 1}%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/30 flex justify-between items-center">
              <div>
                <span className="text-amber-400 font-bold block">Warning Band</span>
                <span className="text-[10px] text-slate-400 font-sans">Approaching interface capacity</span>
              </div>
              <span className="text-amber-400 font-bold text-sm">{thresholds.warning}% — {thresholds.critical - 1}%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-red-500/30 flex justify-between items-center">
              <div>
                <span className="text-red-400 font-bold block">Critical Bottleneck</span>
                <span className="text-[10px] text-slate-400 font-sans">Queue saturation & packet drop</span>
              </div>
              <span className="text-red-400 font-bold text-sm">&gt;= {thresholds.critical}%</span>
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={() => setCurrentPage('settings')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Adjust Thresholds in Settings →
            </button>
          </div>
        </div>

        {/* Dynamic Utilization Spectrum Bar */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-mono uppercase text-slate-400">Bandwidth Saturation Spectrum</h4>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              When full-duplex traffic exceeds capacity in either direction, queuing latency increases exponentially according to <em>Kleinrock's Queuing Formula</em>: T = 1 / (μC - λ).
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative h-6 rounded-lg bg-slate-950 overflow-hidden flex border border-slate-800">
              <div style={{ width: `${thresholds.warning}%` }} className="bg-emerald-500/30 border-r border-emerald-500/50 flex items-center justify-center text-[10px] font-mono text-emerald-300">
                Normal (&lt;{thresholds.warning}%)
              </div>
              <div style={{ width: `${thresholds.critical - thresholds.warning}%` }} className="bg-amber-500/40 border-r border-amber-500/50 flex items-center justify-center text-[10px] font-mono text-amber-300">
                Warning
              </div>
              <div style={{ width: `${100 - thresholds.critical}%` }} className="bg-red-500/50 flex items-center justify-center text-[10px] font-mono text-red-300">
                Critical Bottleneck (&gt;={thresholds.critical}%)
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0%</span>
              <span>{thresholds.warning}% (Warn Limit)</span>
              <span>{thresholds.critical}% (Crit Limit)</span>
              <span>100% (Line Rate)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
            <strong className="text-slate-200">Current Status:</strong>{' '}
            {congestedInterfaces.length === 0 ? (
              <span className="text-emerald-400 font-semibold">All interfaces are operating within normal capacity limits. No bottleneck detected.</span>
            ) : (
              <span className="text-red-400 font-semibold">{congestedInterfaces.length} interface(s) currently exceeding configured capacity thresholds!</span>
            )}
          </div>
        </div>
      </div>

      {/* Congested Interfaces Detail List */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Currently Detected Congested Interfaces ({congestedInterfaces.length})
            </h3>
          </div>

          {congestedInterfaces.length > 0 && (
            <button
              onClick={() => setCurrentPage('alerts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <span>Manage Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {congestedInterfaces.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Zero Congested Interfaces Detected</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Network traffic is smoothly distributed across all routers, switches, and server uplinks. Click <strong>Trigger Warning</strong> or <strong>Trigger Critical</strong> above to simulate traffic spikes.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {congestedInterfaces.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
                  item.severity === 'Critical'
                    ? 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/20'
                    : 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/20'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    item.severity === 'Critical' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.severity === 'Critical' ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-100">{item.device.device_name}</h4>
                      <span className="text-xs text-slate-400 font-mono">({item.device.ip_address})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        item.severity === 'Critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'
                      }`}>
                        {item.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 font-mono">
                      Interface: <span className="text-cyan-300 font-semibold">{item.iface.name}</span> (Capacity: {formatBits(item.iface.speed)})
                    </p>

                    <p className="text-[11px] text-slate-400 mt-1 font-sans">
                      Detected at {item.detectedAt} • Heaviest channel: <strong className="text-slate-200">{item.direction}</strong> ({item.direction === 'Inbound' ? formatBits(item.iface.inbound_bps) : formatBits(item.iface.outbound_bps)})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono block">Peak Utilization</span>
                    <span className={`text-2xl font-bold font-mono ${
                      item.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {item.maxUtil}%
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedDeviceModal(item.device)}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
                  >
                    Inspect Device
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
