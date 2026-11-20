import React, { useState, useMemo } from 'react';
import {
  Server,
  Search,
  Filter,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';

function formatBits(bps) {
  if (bps >= 1_000_000_000) return `${(bps / 1_000_000_000).toFixed(2)} Gbps`;
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(2)} Kbps`;
  return `${bps} bps`;
}

export default function DeviceMonitoring() {
  const { telemetry, setSelectedDeviceModal, thresholds } = useNetwork();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Normal' | 'Warning' | 'Critical'
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('ALL'); // 'ALL' | 'Router' | 'Switch' | 'Server'

  // Flatten devices into rows of (device + interface)
  const rows = useMemo(() => {
    const list = [];
    Object.values(telemetry).forEach(dev => {
      dev.interfaces.forEach(iface => {
        list.push({
          deviceId: dev.id,
          device_name: dev.device_name,
          device_type: dev.device_type,
          ip_address: dev.ip_address,
          mac_address: dev.mac_address,
          location: dev.location,
          interface_name: iface.name,
          speed: iface.speed,
          inbound_bps: iface.inbound_bps,
          outbound_bps: iface.outbound_bps,
          inbound_utilization: iface.inbound_utilization,
          outbound_utilization: iface.outbound_utilization,
          status: iface.status,
          rawDevice: dev
        });
      });
    });
    return list;
  }, [telemetry]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      // Search
      const searchMatch =
        searchTerm === '' ||
        r.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.interface_name.toLowerCase().includes(searchTerm.toLowerCase());

      // Status Filter
      const statusMatch = statusFilter === 'ALL' || r.status === statusFilter;

      // Type Filter
      const typeMatch = deviceTypeFilter === 'ALL' || r.device_type === deviceTypeFilter;

      return searchMatch && statusMatch && typeMatch;
    });
  }, [rows, searchTerm, statusFilter, deviceTypeFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Search and Filters Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by device, IP, or interface..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {['ALL', 'Normal', 'Warning', 'Critical'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  statusFilter === st
                    ? st === 'Critical' ? 'bg-red-600 text-white' :
                      st === 'Warning' ? 'bg-amber-600 text-white' :
                      st === 'Normal' ? 'bg-emerald-600 text-white' :
                      'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Device Type Filter */}
          <select
            value={deviceTypeFilter}
            onChange={(e) => setDeviceTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Device Types</option>
            <option value="Router">Routers</option>
            <option value="Switch">Switches</option>
            <option value="Server">Servers</option>
          </select>
        </div>
      </div>

      {/* Scope Disclaimer Banner */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center space-x-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Monitoring Scope:</strong> SNMP v1 interface-level monitoring. Network traffic is aggregated at the interface port; individual workstation or client host traffic is fictionalized for demonstration.
        </span>
      </div>

      {/* Device & Interface Matrix Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">MAC Address</th>
                <th className="py-3 px-4">Interface</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Inbound Rate</th>
                <th className="py-3 px-4">Outbound Rate</th>
                <th className="py-3 px-4">In Util</th>
                <th className="py-3 px-4">Out Util</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredRows.map((r, idx) => {
                const isCritical = r.status === 'Critical';
                const isWarning = r.status === 'Warning';

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isCritical ? 'bg-red-950/20 hover:bg-red-950/30' :
                      isWarning ? 'bg-amber-950/20 hover:bg-amber-950/30' :
                      'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 font-sans font-semibold text-slate-100 flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        isCritical ? 'bg-red-400 animate-ping' :
                        isWarning ? 'bg-amber-400' :
                        'bg-emerald-400'
                      }`} />
                      <span>{r.device_name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{r.ip_address}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{r.mac_address}</td>
                    <td className="py-3 px-4 text-slate-200">{r.interface_name}</td>
                    <td className="py-3 px-4 text-slate-400">{formatBits(r.speed)}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{formatBits(r.inbound_bps)}</td>
                    <td className="py-3 px-4 text-cyan-400 font-semibold">{formatBits(r.outbound_bps)}</td>
                    <td className="py-3 px-4">
                      <span className={r.inbound_utilization >= thresholds.critical ? 'text-red-400 font-bold' : r.inbound_utilization >= thresholds.warning ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                        {r.inbound_utilization}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={r.outbound_utilization >= thresholds.critical ? 'text-red-400 font-bold' : r.outbound_utilization >= thresholds.warning ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                        {r.outbound_utilization}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' :
                        isWarning ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedDeviceModal(r.rawDevice)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 text-[11px] font-sans font-medium transition-all inline-flex items-center space-x-1"
                      >
                        <span>Drilldown</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
