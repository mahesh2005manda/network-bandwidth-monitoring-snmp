import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  Globe,
  Router,
  Layers,
  Server,
  Activity,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';
import { TOPOLOGY_NODES, TOPOLOGY_LINKS } from '../data/networkDataset';

function formatBits(bps) {
  if (bps >= 1_000_000_000) return `${(bps / 1_000_000_000).toFixed(2)} Gbps`;
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(2)} Kbps`;
  return `${bps} bps`;
}

export default function NetworkTopology() {
  const { telemetry, thresholds, setSelectedDeviceModal } = useNetwork();
  const [selectedNodeId, setSelectedNodeId] = useState('dev-1');

  // Compute status for each node based on its interfaces
  const nodeStatusMap = useMemo(() => {
    const map = {};
    TOPOLOGY_NODES.forEach(node => {
      if (node.id === 'internet') {
        map[node.id] = { status: 'Normal', maxUtil: 30 };
        return;
      }
      const dev = telemetry[node.id];
      if (!dev) {
        map[node.id] = { status: 'Normal', maxUtil: 0 };
        return;
      }
      let highest = 0;
      let status = 'Normal';
      dev.interfaces.forEach(i => {
        const u = Math.max(i.inbound_utilization, i.outbound_utilization);
        if (u > highest) highest = u;
      });
      if (highest >= thresholds.critical) status = 'Critical';
      else if (highest >= thresholds.warning) status = 'Warning';

      map[node.id] = { status, maxUtil: highest, device: dev };
    });
    return map;
  }, [telemetry, thresholds]);

  // Compute status for links
  const linkStatusMap = useMemo(() => {
    const map = {};
    TOPOLOGY_LINKS.forEach((link, idx) => {
      // Find the interface on the device
      let linkStatus = 'Normal';
      let util = 25;

      const devObj = Object.values(telemetry).find(d => d.device_name === link.deviceName);
      if (devObj) {
        const ifaceObj = devObj.interfaces.find(i => i.name === link.interfaceName);
        if (ifaceObj) {
          util = Math.max(ifaceObj.inbound_utilization, ifaceObj.outbound_utilization);
          if (util >= thresholds.critical) linkStatus = 'Critical';
          else if (util >= thresholds.warning) linkStatus = 'Warning';
        }
      }
      map[idx] = { status: linkStatus, util, link };
    });
    return map;
  }, [telemetry, thresholds]);

  const activeSelectedDev = nodeStatusMap[selectedNodeId]?.device;

  return (
    <div className="p-6 space-y-6">
      {/* Topology Intro Header */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          <span>Interactive Enterprise Network Hierarchy. Click any device node to inspect telemetry.</span>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 font-mono text-[11px]">
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Normal (&lt;{thresholds.warning}%)</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Warning ({thresholds.warning}%-{thresholds.critical}%)</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-ping-slow" />
            <span>Critical (&gt;={thresholds.critical}%)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Topology Visualizer Canvas (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#090d19] border border-slate-800 relative min-h-[580px] flex items-center justify-center overflow-hidden">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:24px_24px]" />

          <svg className="w-full h-[540px] relative z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Draw Links */}
            {TOPOLOGY_LINKS.map((link, idx) => {
              const srcNode = TOPOLOGY_NODES.find(n => n.id === link.source);
              const tgtNode = TOPOLOGY_NODES.find(n => n.id === link.target);
              if (!srcNode || !tgtNode) return null;

              const linkInfo = linkStatusMap[idx];
              const isCrit = linkInfo.status === 'Critical';
              const isWarn = linkInfo.status === 'Warning';

              const strokeColor = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#334155';
              const strokeWidth = isCrit ? '1.2' : isWarn ? '1.0' : '0.6';

              return (
                <g key={idx}>
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isCrit ? '1 1' : 'none'}
                    className={isCrit ? 'animate-pulse' : ''}
                  />
                  {/* Midpoint badge for Congested links */}
                  {(isCrit || isWarn) && (
                    <circle
                      cx={(srcNode.x + tgtNode.x) / 2}
                      cy={(srcNode.y + tgtNode.y) / 2}
                      r="1.8"
                      fill={isCrit ? '#ef4444' : '#f59e0b'}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Draw Device Nodes as absolute HTML elements on top of SVG */}
          <div className="absolute inset-0 p-6 pointer-events-none">
            {TOPOLOGY_NODES.map(node => {
              const nodeInfo = nodeStatusMap[node.id];
              const isSelected = selectedNodeId === node.id;
              const isCrit = nodeInfo.status === 'Critical';
              const isWarn = nodeInfo.status === 'Warning';

              let IconComponent = Server;
              if (node.type === 'cloud') IconComponent = Globe;
              else if (node.type === 'router') IconComponent = Router;
              else if (node.type === 'core_switch' || node.type === 'switch') IconComponent = Layers;

              return (
                <div
                  key={node.id}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`absolute pointer-events-auto cursor-pointer p-2.5 rounded-xl border flex items-center space-x-2.5 transition-all shadow-lg ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 bg-slate-900 border-cyan-400 scale-105 z-20'
                      : isCrit
                      ? 'bg-red-950/90 border-red-500 text-red-200 animate-pulse-subtle z-10'
                      : isWarn
                      ? 'bg-amber-950/90 border-amber-500 text-amber-200 z-10'
                      : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 text-slate-200 hover:scale-105'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${
                    isCrit ? 'bg-red-500 text-white' :
                    isWarn ? 'bg-amber-500 text-slate-950' :
                    'bg-slate-800 text-cyan-400'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="text-left select-none">
                    <div className="text-[11px] font-bold font-sans flex items-center space-x-1">
                      <span>{node.label}</span>
                      {isCrit && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">{node.ip}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Telemetry Inspector Drawer */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono uppercase text-slate-400">Node Inspector</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                nodeStatusMap[selectedNodeId]?.status === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                nodeStatusMap[selectedNodeId]?.status === 'Warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {nodeStatusMap[selectedNodeId]?.status}
              </span>
            </div>

            {selectedNodeId === 'internet' ? (
              <div className="py-6 space-y-2 text-xs text-slate-400">
                <h4 className="text-sm font-bold text-slate-200">External WAN Gateway (ISP)</h4>
                <p>Public IP: 203.0.113.1</p>
                <p>Connects via optical uplink to Main Router GigabitEthernet0/0 WAN interface.</p>
              </div>
            ) : activeSelectedDev ? (
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="text-base font-bold text-slate-100">{activeSelectedDev.device_name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">IP: {activeSelectedDev.ip_address}</p>
                  <p className="text-xs text-slate-400 font-mono">MAC: {activeSelectedDev.mac_address}</p>
                  <p className="text-xs text-slate-400 mt-1">{activeSelectedDev.role}</p>
                </div>

                {/* Interfaces list */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">
                    Monitored Interfaces ({activeSelectedDev.interfaces.length})
                  </span>

                  {activeSelectedDev.interfaces.map((iface, idx) => {
                    const util = Math.max(iface.inbound_utilization, iface.outbound_utilization);
                    return (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-200 font-semibold">{iface.name}</span>
                          <span className={
                            iface.status === 'Critical' ? 'text-red-400 font-bold' :
                            iface.status === 'Warning' ? 'text-amber-400 font-bold' :
                            'text-emerald-400'
                          }>
                            {util}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              iface.status === 'Critical' ? 'bg-red-500' :
                              iface.status === 'Warning' ? 'bg-amber-500' :
                              'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(100, util)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>In: {formatBits(iface.inbound_bps)}</span>
                          <span>Out: {formatBits(iface.outbound_bps)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {activeSelectedDev && (
            <button
              onClick={() => setSelectedDeviceModal(activeSelectedDev)}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-xs font-semibold text-slate-200 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Open Detailed Diagnostic Window</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
