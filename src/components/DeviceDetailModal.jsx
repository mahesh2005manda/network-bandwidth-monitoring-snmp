import React from 'react';
import { X, Server, Activity, Shield, Cpu, HardDrive, Wifi, ArrowDown, ArrowUp } from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';

function formatBits(bps) {
  if (bps >= 1_000_000_000) return `${(bps / 1_000_000_000).toFixed(2)} Gbps`;
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(2)} Kbps`;
  return `${bps} bps`;
}

function formatBytes(bytes) {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  return `${bytes} B`;
}

export default function DeviceDetailModal() {
  const { selectedDeviceModal, setSelectedDeviceModal, telemetry } = useNetwork();

  if (!selectedDeviceModal) return null;

  // Retrieve latest telemetry for this device
  const device = telemetry[selectedDeviceModal.id] || selectedDeviceModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-gradient-to-r from-slate-900 to-slate-850">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-bold text-slate-100">{device.device_name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {device.device_type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{device.role} • {device.location}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedDeviceModal(null)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Information Grid */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/40 border-b border-slate-800/60 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">IP Address</span>
            <span className="text-slate-200 font-mono font-semibold text-sm">{device.ip_address}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">MAC Address</span>
            <span className="text-slate-200 font-mono font-semibold text-sm">{device.mac_address}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">SNMP Protocol</span>
            <span className="text-cyan-400 font-mono font-semibold">{device.snmp_version}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">System Uptime</span>
            <span className="text-slate-200 font-mono font-semibold">{device.uptime}</span>
          </div>
        </div>

        {/* Academic Clarification Note */}
        <div className="px-6 py-2.5 bg-cyan-950/30 border-b border-cyan-900/40 text-[11px] text-cyan-300 flex items-center justify-between">
          <span>
            <strong>SNMP v1 Scope:</strong> Traffic monitored at interface layer via MIB-II counters (<code>ifInOctets</code>, <code>ifOutOctets</code>). Host endpoints are simulated.
          </span>
          <span className="font-mono text-[10px] text-cyan-400">RFC 1157 / RFC 1213</span>
        </div>

        {/* Interfaces Table */}
        <div className="p-6 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Monitored Network Interfaces ({device.interfaces.length})</span>
          </h4>

          <div className="space-y-4">
            {device.interfaces.map((iface, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  iface.status === 'Critical'
                    ? 'bg-red-950/20 border-red-500/60 shadow-lg shadow-red-950/30'
                    : iface.status === 'Warning'
                    ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-950/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div>
                    <span className="font-mono font-bold text-slate-100 text-sm">{iface.name}</span>
                    <span className="text-xs text-slate-400 ml-2">({iface.role})</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Cap: {formatBits(iface.speed)}
                    </span>
                    <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full uppercase ${
                      iface.status === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' :
                      iface.status === 'Warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    }`}>
                      {iface.status}
                    </span>
                  </div>
                </div>

                {/* Counter & Rate Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/60">
                    <div className="flex items-center space-x-1 text-slate-400 text-[11px] mb-1">
                      <ArrowDown className="w-3 h-3 text-emerald-400" />
                      <span>Inbound Traffic</span>
                    </div>
                    <div className="font-mono font-bold text-slate-200 text-sm">
                      {formatBits(iface.inbound_bps)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Util: <span className="font-bold text-cyan-300">{iface.inbound_utilization}%</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/60">
                    <div className="flex items-center space-x-1 text-slate-400 text-[11px] mb-1">
                      <ArrowUp className="w-3 h-3 text-cyan-400" />
                      <span>Outbound Traffic</span>
                    </div>
                    <div className="font-mono font-bold text-slate-200 text-sm">
                      {formatBits(iface.outbound_bps)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Util: <span className="font-bold text-cyan-300">{iface.outbound_utilization}%</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/60">
                    <span className="text-slate-400 text-[10px] font-mono block">ifInOctets (OID .10)</span>
                    <span className="font-mono text-slate-200 font-semibold text-xs block truncate" title={iface.currentInOctets?.toLocaleString()}>
                      {iface.currentInOctets?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">Cumulative bytes</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/60">
                    <span className="text-slate-400 text-[10px] font-mono block">ifOutOctets (OID .16)</span>
                    <span className="font-mono text-slate-200 font-semibold text-xs block truncate" title={iface.currentOutOctets?.toLocaleString()}>
                      {iface.currentOutOctets?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">Cumulative bytes</span>
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="mt-3 pt-3 border-t border-slate-800/60">
                  <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                    <span>Highest Direction Utilization: <strong className="text-slate-200">{Math.max(iface.inbound_utilization, iface.outbound_utilization)}%</strong></span>
                    <span className="font-mono">Full-Duplex Evaluation</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        iface.status === 'Critical' ? 'bg-red-500' :
                        iface.status === 'Warning' ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(iface.inbound_utilization, iface.outbound_utilization))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={() => setSelectedDeviceModal(null)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
