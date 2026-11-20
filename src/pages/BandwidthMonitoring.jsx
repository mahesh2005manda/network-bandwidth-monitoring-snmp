import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  ArrowDown,
  ArrowUp,
  Cpu,
  HelpCircle,
  Clock,
  Layers,
  Database,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { useNetwork } from '../context/NetworkContext';
import { historicalRecords, SNMP_MIB_DEFINITIONS } from '../data/networkDataset';

function formatBits(bps) {
  if (bps >= 1_000_000_000) return `${(bps / 1_000_000_000).toFixed(2)} Gbps`;
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(2)} Kbps`;
  return `${bps} bps`;
}

export default function BandwidthMonitoring() {
  const { telemetry, thresholds } = useNetwork();

  // Device & Interface Selection
  const deviceList = Object.values(telemetry);
  const [selectedDeviceId, setSelectedDeviceId] = useState(deviceList[0]?.id || 'dev-1');

  const currentDevice = telemetry[selectedDeviceId] || deviceList[0];
  const [selectedInterfaceName, setSelectedInterfaceName] = useState(
    currentDevice?.interfaces[0]?.name || ''
  );

  // Sync interface if device changes
  const activeInterface = currentDevice?.interfaces.find(i => i.name === selectedInterfaceName) || currentDevice?.interfaces[0];

  // Historical data for this device and interface from synthetic dataset
  const interfaceHistory = useMemo(() => {
    if (!currentDevice || !activeInterface) return [];
    return historicalRecords.filter(
      r => r.device_name === currentDevice.device_name && r.interface_name === activeInterface.name
    );
  }, [currentDevice, activeInterface]);

  // Formatted chart points
  const chartData = useMemo(() => {
    return interfaceHistory.map(r => ({
      time: r.timestamp.split(' ')[1] || r.timestamp,
      'Inbound (Mbps)': Math.round((r.inbound_bps / 1_000_000) * 10) / 10,
      'Outbound (Mbps)': Math.round((r.outbound_bps / 1_000_000) * 10) / 10,
      'Inbound Util (%)': r.inbound_utilization,
      'Outbound Util (%)': r.outbound_utilization
    }));
  }, [interfaceHistory]);

  return (
    <div className="p-6 space-y-6">
      {/* Device & Interface Selector Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Select Device
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                setSelectedDeviceId(e.target.value);
                const dev = telemetry[e.target.value];
                if (dev && dev.interfaces.length > 0) {
                  setSelectedInterfaceName(dev.interfaces[0].name);
                }
              }}
              className="bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              {deviceList.map(dev => (
                <option key={dev.id} value={dev.id}>
                  {dev.device_name} ({dev.ip_address})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Select Interface
            </label>
            <select
              value={activeInterface?.name}
              onChange={(e) => setSelectedInterfaceName(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              {currentDevice?.interfaces.map(iface => (
                <option key={iface.name} value={iface.name}>
                  {iface.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Operational Status</span>
            <span className={`font-mono font-bold uppercase px-2.5 py-0.5 rounded ${
              activeInterface?.status === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
              activeInterface?.status === 'Warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {activeInterface?.status || 'Normal'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Interface Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Interface Capacity */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-xs block mb-1">Interface Capacity (ifSpeed)</span>
          <div className="text-xl font-bold font-mono text-slate-100">
            {formatBits(activeInterface?.speed || 1_000_000_000)}
          </div>
          <span className="text-[11px] text-cyan-400 font-mono mt-1 block">
            OID: 1.3.6.1.2.1.2.2.1.5
          </span>
        </div>

        {/* Metric 2: Current Inbound Traffic */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Inbound Rate (bps)</span>
            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {formatBits(activeInterface?.inbound_bps || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex justify-between font-mono">
            <span>Utilization:</span>
            <strong className="text-slate-200">{activeInterface?.inbound_utilization || 0}%</strong>
          </div>
        </div>

        {/* Metric 3: Current Outbound Traffic */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Outbound Rate (bps)</span>
            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {formatBits(activeInterface?.outbound_bps || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex justify-between font-mono">
            <span>Utilization:</span>
            <strong className="text-slate-200">{activeInterface?.outbound_utilization || 0}%</strong>
          </div>
        </div>

        {/* Metric 4: Peak Direction Utilization */}
        <div className={`p-4 rounded-xl border ${
          activeInterface?.status === 'Critical' ? 'bg-red-950/30 border-red-500/60' :
          activeInterface?.status === 'Warning' ? 'bg-amber-950/30 border-amber-500/60' :
          'bg-slate-900/80 border-slate-800'
        }`}>
          <span className="text-slate-400 text-xs block mb-1">Max Utilization (Full-Duplex)</span>
          <div className={`text-xl font-bold font-mono ${
            activeInterface?.status === 'Critical' ? 'text-red-400' :
            activeInterface?.status === 'Warning' ? 'text-amber-400' :
            'text-emerald-400'
          }`}>
            {Math.max(activeInterface?.inbound_utilization || 0, activeInterface?.outbound_utilization || 0)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-mono">
            Evaluated independently per direction
          </span>
        </div>
      </div>

      {/* Utilization Gauges / Visual Indicators */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Full-Duplex Utilization Breakdown</span>
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-mono">
              <span className="flex items-center space-x-1.5">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Inbound Channel: {formatBits(activeInterface?.inbound_bps || 0)}</span>
              </span>
              <span className="font-bold text-slate-100">{activeInterface?.inbound_utilization}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeInterface?.inbound_utilization >= thresholds.critical ? 'bg-red-500' :
                  activeInterface?.inbound_utilization >= thresholds.warning ? 'bg-amber-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, activeInterface?.inbound_utilization || 0)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-mono">
              <span className="flex items-center space-x-1.5">
                <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Outbound Channel: {formatBits(activeInterface?.outbound_bps || 0)}</span>
              </span>
              <span className="font-bold text-slate-100">{activeInterface?.outbound_utilization}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeInterface?.outbound_utilization >= thresholds.critical ? 'bg-red-500' :
                  activeInterface?.outbound_utilization >= thresholds.warning ? 'bg-amber-500' :
                  'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, activeInterface?.outbound_utilization || 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dual Traffic Graphs (Inbound & Outbound) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inbound Graph */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <ArrowDown className="w-4 h-4 text-emerald-400" />
              <span>Inbound Traffic Rate (Mbps)</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Historical Readings</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" M" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="Inbound (Mbps)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outbound Graph */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <ArrowUp className="w-4 h-4 text-cyan-400" />
              <span>Outbound Traffic Rate (Mbps)</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Historical Readings</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" M" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="Outbound (Mbps)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SNMP MIB-II Interface Group Educational Reference Panel */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100">
            SNMP v1 MIB-II Interface Group Counter Reference (RFC 1213)
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          In SNMP v1, network devices do not store traffic rates directly. Instead, the SNMP Agent maintains 32-bit cumulative byte counters that increment continuously. The SNMP Manager queries these counters at interval Δt and calculates the bit rate.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-cyan-300">ifSpeed</strong>
              <span className="text-[10px] text-slate-500">Gauge32</span>
            </div>
            <span className="text-[10px] text-slate-400 block mb-2">OID: 1.3.6.1.2.1.2.2.1.5</span>
            <p className="text-[11px] text-slate-300 font-sans">
              Theoretical bandwidth capacity of the interface in bits per second (e.g. 100,000,000 for 100 Mbps, 1,000,000,000 for 1 Gbps).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-emerald-400">ifInOctets</strong>
              <span className="text-[10px] text-slate-500">Counter32</span>
            </div>
            <span className="text-[10px] text-slate-400 block mb-2">OID: 1.3.6.1.2.1.2.2.1.10</span>
            <p className="text-[11px] text-slate-300 font-sans">
              Cumulative incoming bytes received on this interface since device boot. Resets upon counter overflow (2^32 - 1).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-cyan-400">ifOutOctets</strong>
              <span className="text-[10px] text-slate-500">Counter32</span>
            </div>
            <span className="text-[10px] text-slate-400 block mb-2">OID: 1.3.6.1.2.1.2.2.1.16</span>
            <p className="text-[11px] text-slate-300 font-sans">
              Cumulative outgoing bytes transmitted by this interface. Bandwidth rate is derived using consecutive counter deltas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
