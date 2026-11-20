import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Volume2,
  VolumeX,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';

const PAGE_TITLES = {
  overview: { title: 'Network Overview', sub: 'Real-time telemetry, bandwidth trends, and network health index' },
  bandwidth: { title: 'Bandwidth Monitoring', sub: 'Inbound vs outbound traffic rates and MIB-II interface counter analysis' },
  devices: { title: 'Device Monitoring', sub: 'Interface-level traffic matrix across routers, switches, and servers' },
  congestion: { title: 'Congestion Detection', sub: 'Automated bottleneck detection engine and threshold evaluator' },
  alerts: { title: 'Alert Management', sub: 'Administrator incident queue, acknowledgment, and resolution lifecycle' },
  topology: { title: 'Network Topology', sub: 'End-to-end interactive infrastructure map and congestion path highlighting' },
  'how-it-works': { title: 'How The System Works', sub: 'SNMP v1 architecture, MIB tree structure, and mathematical formulas' },
  settings: { title: 'System Settings', sub: 'Configure detection thresholds, polling interval, and alert preferences' },
  presentation: { title: 'Faculty Presentation Mode', sub: '10-step guided demonstration flow for academic defense' }
};

export default function Header({ currentPage }) {
  const {
    isMonitoringActive,
    setIsMonitoringActive,
    simulationMode,
    applySimulationMode,
    resetSimulation,
    pollingInterval,
    soundEnabled,
    setSoundEnabled,
    lastPollTime
  } = useNetwork();

  const currentInfo = PAGE_TITLES[currentPage] || { title: 'Dashboard', sub: 'Network Monitoring' };

  return (
    <header className="bg-[#0b1020]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4">
      {/* Title & Description */}
      <div>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          {currentInfo.title}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {currentInfo.sub}
        </p>
      </div>

      {/* Control Actions */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Polling Interval & Last Time */}
        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Poll:</span>
          <span className="font-mono text-cyan-300 font-semibold">{pollingInterval}s</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-slate-400">{lastPollTime}</span>
        </div>

        {/* Monitoring Pause/Resume Toggle */}
        <button
          onClick={() => setIsMonitoringActive(!isMonitoringActive)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isMonitoringActive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
          }`}
          title={isMonitoringActive ? 'Click to Pause Polling' : 'Click to Resume Polling'}
        >
          {isMonitoringActive ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Monitoring Active</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Monitoring Paused</span>
            </>
          )}
        </button>

        {/* Quick Simulation Triggers */}
        <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800 text-xs">
          <button
            onClick={() => applySimulationMode('normal')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              simulationMode === 'normal'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Set simulation to normal traffic conditions"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Normal</span>
          </button>

          <button
            onClick={() => applySimulationMode('warning')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              simulationMode === 'warning'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
            title="Trigger traffic spike crossing Warning threshold"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Warning</span>
          </button>

          <button
            onClick={() => applySimulationMode('critical')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              simulationMode === 'critical'
                ? 'bg-red-600 text-white shadow-sm animate-pulse'
                : 'text-slate-400 hover:text-red-300 hover:bg-slate-800'
            }`}
            title="Trigger critical congestion bottleneck (>85%)"
          >
            <AlertOctagon className="w-3 h-3" />
            <span>Critical</span>
          </button>

          <button
            onClick={resetSimulation}
            className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all ml-1"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg border text-xs transition-all ${
            soundEnabled
              ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:text-cyan-300'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Alert Sounds Enabled (Click to Mute)' : 'Alert Sounds Muted (Click to Unmute)'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
