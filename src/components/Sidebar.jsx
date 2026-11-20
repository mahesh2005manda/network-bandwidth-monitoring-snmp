import React from 'react';
import {
  Activity,
  BarChart3,
  Server,
  AlertTriangle,
  Bell,
  GitBranch,
  BookOpen,
  Settings,
  Presentation,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';

const NAV_ITEMS = [
  { id: 'overview', label: 'Network Overview', icon: Activity, page: 'overview' },
  { id: 'bandwidth', label: 'Bandwidth Monitoring', icon: BarChart3, page: 'bandwidth' },
  { id: 'devices', label: 'Device Monitoring', icon: Server, page: 'devices' },
  { id: 'congestion', label: 'Congestion Detection', icon: AlertTriangle, page: 'congestion' },
  { id: 'alerts', label: 'Alert Management', icon: Bell, page: 'alerts', hasBadge: true },
  { id: 'topology', label: 'Network Topology', icon: GitBranch, page: 'topology' },
  { id: 'how-it-works', label: 'How It Works', icon: BookOpen, page: 'how-it-works' },
  { id: 'settings', label: 'Settings', icon: Settings, page: 'settings' }
];

export default function Sidebar({ currentPage, setCurrentPage }) {
  const { metrics, simulationMode, isMonitoringActive } = useNetwork();
  const unreadAlerts = metrics.activeCriticalAlerts + metrics.activeWarningAlerts;

  return (
    <aside className="w-64 bg-[#0d1424] border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 tracking-wider">SNMPv1 NetMon</h1>
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Bottleneck Engine</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Status Indicator */}
        <div className="mx-4 mt-4 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isMonitoringActive ? 'bg-emerald-400 animate-ping-slow' : 'bg-slate-500'}`} />
            <span className="text-slate-300 font-medium">
              {isMonitoringActive ? 'SNMP Polling Active' : 'Polling Paused'}
            </span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
            simulationMode === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
            simulationMode === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}>
            {simulationMode}
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-2">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.page)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.hasBadge && unreadAlerts > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                    metrics.activeCriticalAlerts > 0
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-amber-500 text-slate-900'
                  }`}>
                    {unreadAlerts}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Presentation Mode Trigger & Academic Footer */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <button
          onClick={() => setCurrentPage('presentation')}
          className={`w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border ${
            currentPage === 'presentation'
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
              : 'bg-indigo-950/50 text-indigo-300 border-indigo-800/60 hover:bg-indigo-900/70 hover:text-white'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>Faculty Presentation Mode</span>
        </button>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span>NDM Project</span>
            <span className="text-cyan-400 text-[10px] font-mono">SNMP MIB-II</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Network Design & Management
          </p>
        </div>
      </div>
    </aside>
  );
}
