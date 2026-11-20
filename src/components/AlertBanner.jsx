import React from 'react';
import { AlertOctagon, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';

export default function AlertBanner({ setCurrentPage }) {
  const { alerts, acknowledgeAlert } = useNetwork();

  // Find the most recent active Critical Alert
  const activeCritical = alerts.find(a => a.severity === 'Critical' && a.status === 'Active');

  if (!activeCritical) return null;

  return (
    <div className="mx-6 mt-4 p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-red-900/60 to-red-950/80 border-2 border-red-500/80 shadow-lg shadow-red-950/50 flex flex-wrap items-center justify-between gap-4 animate-pulse-subtle">
      <div className="flex items-start space-x-3.5">
        <div className="p-2 rounded-lg bg-red-600/30 border border-red-500/50 text-red-400 shrink-0 mt-0.5">
          <AlertOctagon className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold font-mono uppercase px-2 py-0.5 rounded bg-red-500 text-white tracking-wider">
              CRITICAL BOTTLENECK DETECTED
            </span>
            <span className="text-xs text-red-300 font-mono">
              Alert ID: {activeCritical.id}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-100 mt-1">
            {activeCritical.device_name} ({activeCritical.ip_address}) — {activeCritical.interface_name}
          </p>
          <p className="text-xs text-red-200 mt-0.5">
            Utilization reached <span className="font-bold font-mono text-red-300 text-sm">{activeCritical.utilization}%</span>. Network traffic is exceeding interface capacity. Immediate administrator intervention recommended.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2.5 shrink-0">
        <button
          onClick={() => acknowledgeAlert(activeCritical.id)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-100 border border-red-600/60 text-xs font-semibold transition-all shadow-sm"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Acknowledge Alert</span>
        </button>

        <button
          onClick={() => setCurrentPage('alerts')}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30"
        >
          <span>Open Alert Center</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
