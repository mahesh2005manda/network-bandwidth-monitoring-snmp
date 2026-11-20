import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Save,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';

export default function Settings() {
  const {
    thresholds,
    updateThresholds,
    pollingInterval,
    setPollingInterval,
    isMonitoringActive,
    setIsMonitoringActive,
    soundEnabled,
    setSoundEnabled,
    resetSimulation,
    clearResolvedAlerts
  } = useNetwork();

  const [warnInput, setWarnInput] = useState(thresholds.warning);
  const [critInput, setCritInput] = useState(thresholds.critical);
  const [pollInput, setPollInput] = useState(pollingInterval);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const w = Math.max(10, Math.min(Number(warnInput), Number(critInput) - 1));
    const c = Math.max(w + 1, Math.min(100, Number(critInput)));
    const p = Math.max(1, Math.min(15, Number(pollInput)));

    updateThresholds(w, c);
    setPollingInterval(p);
    setWarnInput(w);
    setCritInput(c);
    setPollInput(p);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRestoreDefaults = () => {
    updateThresholds(70, 85);
    setPollingInterval(3);
    setWarnInput(70);
    setCritInput(85);
    setPollInput(3);
    setSoundEnabled(true);
    resetSimulation();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Settings Form Container */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <span>Monitoring & Alerting Configuration</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust threshold parameters and simulation dynamics. Changes take effect immediately in the detection engine.
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>Settings Saved</span>
            </div>
          )}
        </div>

        {/* Section 1: Congestion Thresholds */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold">
            1. Bandwidth Utilization Thresholds (%)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Warning Threshold */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-amber-400">Warning Threshold</span>
                <span className="font-mono font-bold text-slate-100 text-sm">{warnInput}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="89"
                value={warnInput}
                onChange={(e) => setWarnInput(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-slate-400">
                Interfaces exceeding this value will change status to <strong>Warning</strong> and trigger a warning alert.
              </p>
            </div>

            {/* Critical Threshold */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-red-400">Critical Bottleneck Threshold</span>
                <span className="font-mono font-bold text-slate-100 text-sm">{critInput}%</span>
              </div>
              <input
                type="range"
                min={warnInput + 1}
                max="98"
                value={critInput}
                onChange={(e) => setCritInput(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <p className="text-[11px] text-slate-400">
                Interfaces exceeding this value will change status to <strong>Critical</strong> and trigger emergency alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Polling & Engine Engine Dynamics */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold">
            2. Engine Dynamics & Polling Interval
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Polling Interval */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">SNMP Polling Interval (Δt)</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">{pollInput} seconds</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={pollInput}
                onChange={(e) => setPollInput(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <p className="text-[11px] text-slate-400">
                Frequency of consecutive <code>ifInOctets</code> / <code>ifOutOctets</code> counter evaluations.
              </p>
            </div>

            {/* Polling Pause/Resume Toggle */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Monitoring Loop State</span>
                <span className="text-[11px] text-slate-400">
                  {isMonitoringActive ? 'Engine is actively polling devices' : 'Engine polling is currently paused'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMonitoringActive(!isMonitoringActive)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                  isMonitoringActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                }`}
              >
                {isMonitoringActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isMonitoringActive ? 'Active' : 'Paused'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Audio Preferences */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold">
            3. Notification Sounds (Web Audio API)
          </h4>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-300 block">Alert Sound Synthesis</span>
              <span className="text-[11px] text-slate-400">
                Play synthesized chimes for Warning events and urgency sirens for Critical bottleneck events.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                soundEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'Enabled' : 'Muted'}</span>
            </button>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Academic Defaults (70% / 85%)</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition-all shadow-lg shadow-cyan-600/20 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Apply & Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
