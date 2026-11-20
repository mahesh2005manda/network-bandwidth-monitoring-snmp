import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  ShieldAlert,
  Info,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';

function formatBits(bps) {
  if (bps >= 1_000_000_000) return `${(bps / 1_000_000_000).toFixed(2)} Gbps`;
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(2)} Kbps`;
  return `${bps} bps`;
}

export default function AlertManagement() {
  const {
    alerts,
    telemetry,
    thresholds,
    acknowledgeAlert,
    resolveAlert,
    markProblemUnresolved,
    clearResolvedAlerts,
    soundEnabled,
    setSoundEnabled
  } = useNetwork();

  const [severityFilter, setSeverityFilter] = useState('ALL'); // 'ALL' | 'Active' | 'Resolved' | 'Critical' | 'Warning'

  // Helper to retrieve current live bandwidth utilization from telemetry for an alert
  const getCurrentInterfaceTelemetry = (deviceName, interfaceName) => {
    const dev = Object.values(telemetry).find(d => d.device_name === deviceName);
    if (!dev) return null;
    const iface = dev.interfaces?.find(i => i.name === interfaceName);
    return iface || null;
  };

  // C. Alert Summary Metrics (Calculated dynamically)
  const totalAlertsCount = alerts.length;
  const activeCriticalCount = alerts.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length;
  const activeWarningCount = alerts.filter(a => a.severity === 'Warning' && a.status !== 'Resolved').length;
  const resolvedCount = alerts.filter(a => a.status === 'Resolved').length;

  // Filtered Active Alerts
  const activeAlerts = alerts.filter(a => {
    if (a.status === 'Resolved') return false;
    if (severityFilter === 'Critical') return a.severity === 'Critical';
    if (severityFilter === 'Warning') return a.severity === 'Warning';
    if (severityFilter === 'Resolved') return false;
    return true;
  });

  // Filtered Resolved Alerts
  const resolvedAlerts = alerts.filter(a => {
    if (a.status !== 'Resolved') return false;
    if (severityFilter === 'Critical') return a.severity === 'Critical';
    if (severityFilter === 'Warning') return a.severity === 'Warning';
    if (severityFilter === 'Active') return false;
    return true;
  });

  const showActiveSection = severityFilter !== 'Resolved';
  const showResolvedSection = severityFilter !== 'Active';

  return (
    <div className="p-6 space-y-6">
      {/* C. Alert Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-xs block mb-1">Total Generated Alerts</span>
          <div className="text-2xl font-bold font-mono text-slate-100">{totalAlertsCount}</div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Persisted in LocalStorage</span>
        </div>

        {/* Active Critical Alerts */}
        <div className={`p-4 rounded-xl border transition-all ${
          activeCriticalCount > 0
            ? 'bg-red-950/30 border-red-500/60 shadow-md shadow-red-950/20'
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <span className="text-slate-400 text-xs block mb-1">Active Critical Alerts</span>
          <div className={`text-2xl font-bold font-mono ${
            activeCriticalCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'
          }`}>
            {activeCriticalCount}
          </div>
          <span className="text-[10px] text-red-400/80 font-mono mt-1 block">
            {activeCriticalCount > 0 ? 'Requires immediate investigation' : 'Zero critical bottlenecks'}
          </span>
        </div>

        {/* Active Warning Alerts */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/40">
          <span className="text-slate-400 text-xs block mb-1">Active Warning Alerts</span>
          <div className="text-2xl font-bold font-mono text-amber-400">{activeWarningCount}</div>
          <span className="text-[10px] text-amber-400/80 font-mono mt-1 block">Approaching configured limit</span>
        </div>

        {/* Resolved Alerts */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 text-xs block mb-1">Resolved Alerts</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{resolvedCount}</div>
          <span className="text-[10px] text-emerald-400/80 font-mono mt-1 block">Acknowledged by Administrator</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Severity & Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          {[
            { id: 'ALL', label: `All Alerts (${totalAlertsCount})` },
            { id: 'Active', label: `Active (${activeCriticalCount + activeWarningCount})` },
            { id: 'Resolved', label: `Resolved (${resolvedCount})` },
            { id: 'Critical', label: `Critical Only (${activeCriticalCount})` },
            { id: 'Warning', label: `Warning Only (${activeWarningCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSeverityFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                severityFilter === tab.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              soundEnabled
                ? 'bg-slate-950 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Alert Audio On' : 'Alert Audio Muted'}</span>
          </button>

          {resolvedCount > 0 && (
            <button
              onClick={clearResolvedAlerts}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 hover:text-red-300 border border-slate-700 text-xs text-slate-300 transition-all font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Resolved ({resolvedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Scope Clarification Banner */}
      <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-xs text-cyan-300 flex items-center space-x-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>In-Dashboard Administrator Notification:</strong> Critical and Warning alerts reflect live interface telemetry. Administrator problem resolution records confirmation in audit history while real-time bandwidth monitoring continues uninterrupted.
        </span>
      </div>

      {/* A. Active Alerts Section */}
      {showActiveSection && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Active Alerts ({activeAlerts.length})</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Unresolved Warning and Critical incidents requiring administrator attention
            </span>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No active unresolved alerts in queue</p>
              <p className="text-xs text-slate-500">
                All network interfaces are operating within normal capacity limits. Click <strong>Trigger Warning</strong> or <strong>Trigger Critical</strong> to simulate traffic spikes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map(alert => {
                const isCritical = alert.severity === 'Critical';
                const ifaceData = getCurrentInterfaceTelemetry(alert.device_name, alert.interface_name);
                const currentLiveUtil = ifaceData
                  ? Math.max(ifaceData.inbound_utilization, ifaceData.outbound_utilization)
                  : alert.utilization;

                return (
                  <div
                    key={alert.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCritical
                        ? 'bg-red-950/20 border-red-500/60 shadow-lg shadow-red-950/30'
                        : 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-950/30'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start space-x-3.5">
                        <div className={`p-2.5 rounded-xl mt-0.5 ${
                          isCritical ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {isCritical ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>

                        <div className="space-y-1.5">
                          {/* Top Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-400">{alert.id}</span>
                            <span className="text-slate-500 text-xs">•</span>
                            <span className="text-slate-400 text-xs font-mono">{alert.timestamp}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}>
                              {alert.severity}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              Status: {alert.status}
                            </span>
                          </div>

                          {/* Device & Interface Details */}
                          <h4 className="text-sm font-bold text-slate-100">
                            {alert.device_name} ({alert.ip_address}) — {alert.interface_name}
                          </h4>

                          {/* Description */}
                          <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-3xl">
                            {alert.description}
                          </p>

                          {/* Live Telemetry Info */}
                          <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                            <div>
                              <span>Current Measured Util: </span>
                              <strong className={
                                currentLiveUtil >= thresholds.critical ? 'text-red-400' :
                                currentLiveUtil >= thresholds.warning ? 'text-amber-400' :
                                'text-emerald-400'
                              }>
                                {currentLiveUtil}%
                              </strong>
                            </div>
                            {ifaceData && (
                              <div>
                                <span>Throughput: In {formatBits(ifaceData.inbound_bps)} | Out {formatBits(ifaceData.outbound_bps)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Utilization Badge */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block uppercase">Peak Direction Util</span>
                        <span className={`text-2xl font-bold font-mono ${
                          isCritical ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {currentLiveUtil}%
                        </span>
                      </div>
                    </div>

                    {/* Problem Resolution Feature for Active Critical Alerts */}
                    {isCritical && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                            Has this network problem been resolved?
                          </span>
                          {alert.adminDecision === 'not_resolved' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold uppercase flex items-center space-x-1">
                              <XCircle className="w-3 h-3" />
                              <span>Problem Not Resolved</span>
                            </span>
                          )}
                        </div>

                        {alert.adminDecision === 'not_resolved' && (
                          <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-200">
                            <strong>Problem Not Resolved:</strong> Interface remains in Critical status. Bandwidth monitoring continues actively until congestion clears.
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          {/* Option 1: YES - Problem Resolved */}
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>YES - Problem Resolved</span>
                          </button>

                          {/* Option 2: NO - Problem Not Resolved */}
                          <button
                            onClick={() => markProblemUnresolved(alert.id)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 border ${
                              alert.adminDecision === 'not_resolved'
                                ? 'bg-red-900/60 border-red-500 text-red-100 ring-2 ring-red-500/30'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                            }`}
                          >
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span>NO - Problem Not Resolved</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions for Warning Alerts */}
                    {!isCritical && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Traffic approaching threshold. Acknowledge or resolve alert.
                        </span>
                        <div className="flex items-center space-x-2">
                          {alert.status === 'Active' && (
                            <button
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
                            >
                              Acknowledge
                            </button>
                          )}
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-sm"
                          >
                            Resolve Alert
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* B. Resolved Alerts Section */}
      {showResolvedSection && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Resolved Alerts ({resolvedAlerts.length})</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Audit trail of resolved incidents with resolution timestamps
            </span>
          </div>

          {resolvedAlerts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-500">
              No resolved alerts in history. Alerts marked as resolved will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {resolvedAlerts.map(alert => {
                const ifaceData = getCurrentInterfaceTelemetry(alert.device_name, alert.interface_name);
                const currentLiveUtil = ifaceData
                  ? Math.max(ifaceData.inbound_utilization, ifaceData.outbound_utilization)
                  : alert.utilization;
                const isStillHigh = currentLiveUtil >= thresholds.warning;

                return (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 transition-all"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                          <CheckCircle className="w-4 h-4" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-cyan-400">{alert.id}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 font-mono">Detected: {alert.timestamp}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}>
                              {alert.severity} (Original)
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              Resolved
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-200">
                            {alert.device_name} ({alert.ip_address}) — {alert.interface_name}
                          </h4>

                          <p className="text-[11px] text-slate-400 font-sans max-w-3xl">
                            {alert.description}
                          </p>

                          <div className="text-[11px] font-mono text-emerald-400 pt-0.5">
                            Resolved at: {alert.resolvedAt || 'Acknowledged'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">Recorded Util</span>
                        <span className="text-sm font-bold font-mono text-slate-300">
                          {alert.utilization}%
                        </span>
                      </div>
                    </div>

                    {/* Specific required warning message when bandwidth is still high after resolution confirmation */}
                    {isStillHigh && (
                      <div className="mt-3 p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 flex items-center space-x-2 font-medium">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Resolution acknowledged, but high bandwidth usage is still detected ({currentLiveUtil}%). Monitoring continues.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
