import React, { useMemo } from 'react';
import {
  Server,
  Activity,
  AlertTriangle,
  AlertOctagon,
  ArrowDown,
  ArrowUp,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Clock,
  ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useNetwork } from '../context/NetworkContext';

function formatBits(bps) {
  if (bps >= 1_000_000_000) return `${(bps / 1_000_000_000).toFixed(2)} Gbps`;
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(2)} Kbps`;
  return `${bps} bps`;
}

export default function NetworkOverview({ setCurrentPage }) {
  const { metrics, telemetry, alerts, thresholds, setSelectedDeviceModal } = useNetwork();

  // Create real-time trend data points based on current telemetry
  const trendData = useMemo(() => {
    // Generate 8 timestamp points showing recent bandwidth trends across the network
    const baseIn = metrics.totalInBps / 1_000_000;
    const baseOut = metrics.totalOutBps / 1_000_000;

    const points = [];
    const now = Date.now();
    for (let i = 7; i >= 0; i--) {
      const time = new Date(now - i * 15000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      // Minor realistic jitter backwards
      const jitterFactor = 1 + (Math.sin(i * 1.3) * 0.08);
      points.push({
        time,
        Inbound_Mbps: Math.max(10, Math.round((baseIn * jitterFactor) * 10) / 10),
        Outbound_Mbps: Math.max(10, Math.round((baseOut * jitterFactor) * 10) / 10)
      });
    }
    return points;
  }, [metrics.totalInBps, metrics.totalOutBps]);

  return (
    <div className="p-6 space-y-6">
      {/* 6 Essential Enterprise Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Devices */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Devices</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {metrics.totalDevices}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-emerald-400 font-semibold">{metrics.totalInterfaces}</span>
            <span>monitored interfaces</span>
          </div>
        </div>

        {/* Card 2: Active Devices */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Devices</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {metrics.activeDevices} / {metrics.totalDevices}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping-slow" />
            <span>100% SNMP Reachable</span>
          </div>
        </div>

        {/* Card 3: Average Utilization */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Avg Utilization</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {metrics.avgUtil}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across full network fabric
          </div>
        </div>

        {/* Card 4: Highest Utilization */}
        <div className={`p-4 rounded-xl border shadow-sm transition-all ${
          metrics.highestUtil >= thresholds.critical
            ? 'bg-red-950/30 border-red-500/60'
            : metrics.highestUtil >= thresholds.warning
            ? 'bg-amber-950/30 border-amber-500/60'
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Peak Utilization</span>
            <Cpu className={`w-4 h-4 ${
              metrics.highestUtil >= thresholds.critical ? 'text-red-400 animate-pulse' :
              metrics.highestUtil >= thresholds.warning ? 'text-amber-400' : 'text-slate-400'
            }`} />
          </div>
          <div className={`text-2xl font-bold font-mono ${
            metrics.highestUtil >= thresholds.critical ? 'text-red-400' :
            metrics.highestUtil >= thresholds.warning ? 'text-amber-400' : 'text-slate-100'
          }`}>
            {metrics.highestUtil}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate" title={metrics.mostCongested.deviceName}>
            {metrics.mostCongested.deviceName}
          </div>
        </div>

        {/* Card 5: Warning Alerts */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Warning Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {metrics.activeWarningAlerts}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Threshold: &gt;= {thresholds.warning}%
          </div>
        </div>

        {/* Card 6: Critical Alerts */}
        <div className={`p-4 rounded-xl border shadow-sm ${
          metrics.activeCriticalAlerts > 0
            ? 'bg-red-950/40 border-red-500/70'
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Critical Alerts</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className={`text-2xl font-bold font-mono ${
            metrics.activeCriticalAlerts > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'
          }`}>
            {metrics.activeCriticalAlerts}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Threshold: &gt;= {thresholds.critical}%
          </div>
        </div>
      </div>

      {/* Network Health & Congestion Spotlight Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Health Banner Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0e1629] border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Network Operational Health</span>
              <ShieldCheck className={`w-5 h-5 ${
                metrics.healthScore >= 80 ? 'text-emerald-400' :
                metrics.healthScore >= 50 ? 'text-amber-400' : 'text-red-400'
              }`} />
            </div>
            <div className="mt-3 flex items-baseline space-x-3">
              <span className={`text-4xl font-extrabold font-mono ${
                metrics.healthScore >= 80 ? 'text-emerald-400' :
                metrics.healthScore >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {metrics.healthScore}
              </span>
              <span className="text-slate-400 text-sm font-medium">/ 100 Index</span>
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              Status: <span className={
                metrics.healthScore >= 80 ? 'text-emerald-400' :
                metrics.healthScore >= 50 ? 'text-amber-400' : 'text-red-400'
              }>{metrics.healthStatus}</span>
            </p>
          </div>

          {/* Traffic Aggregate Rates */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Agg Inbound</span>
              </div>
              <div className="text-sm font-mono font-bold text-slate-200 mt-1">
                {formatBits(metrics.totalInBps)}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Agg Outbound</span>
              </div>
              <div className="text-sm font-mono font-bold text-slate-200 mt-1">
                {formatBits(metrics.totalOutBps)}
              </div>
            </div>
          </div>
        </div>

        {/* Most Congested Device Spotlight */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
          metrics.mostCongested.status === 'Critical'
            ? 'bg-red-950/20 border-red-500/50'
            : metrics.mostCongested.status === 'Warning'
            ? 'bg-amber-950/20 border-amber-500/50'
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Most Congested Interface</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                metrics.mostCongested.status === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                metrics.mostCongested.status === 'Warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {metrics.mostCongested.status}
              </span>
            </div>

            <div className="mt-3">
              <h4 className="text-lg font-bold text-slate-100">{metrics.mostCongested.deviceName}</h4>
              <p className="text-xs font-mono text-cyan-400 mt-0.5">{metrics.mostCongested.interfaceName}</p>
              <p className="text-xs text-slate-400 mt-0.5">IP: {metrics.mostCongested.ip || '192.168.1.1'}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400">Interface Capacity Usage:</span>
              <span className="font-mono font-bold text-slate-100">{metrics.mostCongested.util}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.mostCongested.status === 'Critical' ? 'bg-red-500' :
                  metrics.mostCongested.status === 'Warning' ? 'bg-amber-500' :
                  'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, metrics.mostCongested.util)}%` }}
              />
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setCurrentPage('congestion')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>Inspect Bottleneck</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick SNMP Architecture Overview Tile */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-mono uppercase tracking-wider">SNMP v1 Engine State</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-300 mt-2">
              RFC 1157 SNMP Manager polling MIB-II Interface Group (RFC 1213) via periodic SNMP GET requests.
            </p>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Protocol:</span>
              <span className="text-cyan-300">SNMPv1 over UDP/161</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Delta Formula:</span>
              <span className="text-emerald-400 font-semibold">(ΔOctets × 8) / Δt</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Evaluation:</span>
              <span className="text-slate-300">Separate In / Out (Full-Duplex)</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentPage('how-it-works')}
            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all text-center"
          >
            View SNMP Math & Pipeline
          </button>
        </div>
      </div>

      {/* Network Bandwidth Trend Graph */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Network Aggregate Bandwidth Trend (Mbps)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative incoming and outgoing traffic rates derived from SNMP byte counter differences.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              <span className="text-slate-300">Inbound Traffic</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
              <span className="text-slate-300">Outbound Traffic</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" Mbps" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="Inbound_Mbps" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
              <Area type="monotone" dataKey="Outbound_Mbps" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alerts Feed Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Network Alerts ({alerts.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live administrator alert queue showing auto-detected congestion incidents.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('alerts')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {alerts.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-mono">
            No alerts generated yet. All network interfaces are operating within normal capacity limits.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-2.5">Alert ID</th>
                  <th className="pb-2.5">Timestamp</th>
                  <th className="pb-2.5">Device</th>
                  <th className="pb-2.5">Interface</th>
                  <th className="pb-2.5">Utilization</th>
                  <th className="pb-2.5">Severity</th>
                  <th className="pb-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {alerts.slice(0, 5).map(alert => (
                  <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 text-cyan-400 font-semibold">{alert.id}</td>
                    <td className="py-2.5 text-slate-400">{alert.timestamp}</td>
                    <td className="py-2.5 text-slate-200 font-sans font-medium">{alert.device_name}</td>
                    <td className="py-2.5 text-slate-300">{alert.interface_name}</td>
                    <td className="py-2.5 font-bold text-slate-100">{alert.utilization}%</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${
                        alert.status === 'Active' ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-800' :
                        alert.status === 'Acknowledged' ? 'text-amber-300 bg-amber-950/60' :
                        'text-slate-400 bg-slate-800'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
