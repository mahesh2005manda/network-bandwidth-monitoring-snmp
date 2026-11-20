import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { DEVICE_METADATA, historicalRecords } from '../data/networkDataset';
import { playAlertSound } from '../utils/audioAlert';

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  // Settings with LocalStorage persistence
  const [thresholds, setThresholds] = useState(() => {
    try {
      const saved = localStorage.getItem('ndm_snmp_thresholds');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading thresholds from localStorage', e);
    }
    return { warning: 70, critical: 85 };
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('ndm_snmp_sound');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading sound settings from localStorage', e);
    }
    return true;
  });

  const [pollingInterval, setPollingInterval] = useState(3); // seconds
  const [isMonitoringActive, setIsMonitoringActive] = useState(true);
  const [simulationMode, setSimulationMode] = useState('normal'); // 'normal' | 'warning' | 'critical'
  const [selectedDeviceModal, setSelectedDeviceModal] = useState(null);

  // Time & Polling state
  const [currentTimeStep, setCurrentTimeStep] = useState(0);
  const [lastPollTime, setLastPollTime] = useState(new Date().toLocaleTimeString());

  // Load existing alert history or initialize from localStorage
  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('ndm_snmp_alerts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading alerts from localStorage', e);
    }
    return [];
  });

  // Track previous interface status to avoid spamming duplicate alerts every tick
  const prevInterfaceStatusRef = useRef({});

  // Device telemetry state: map of deviceId -> { device, interfaces: [ { ...interfaceMetrics } ] }
  const [telemetry, setTelemetry] = useState(() => {
    const initial = {};
    DEVICE_METADATA.forEach(dev => {
      initial[dev.id] = {
        ...dev,
        interfaces: dev.interfaces.map(iface => {
          const speed = iface.speed;
          const baseInBps = speed * 0.22;
          const baseOutBps = speed * 0.28;
          const initialInOctets = 45000000000 + Math.floor(Math.random() * 5000000000);
          const initialOutOctets = 42000000000 + Math.floor(Math.random() * 5000000000);
          const inUtil = (baseInBps / speed) * 100;
          const outUtil = (baseOutBps / speed) * 100;

          return {
            ...iface,
            prevInOctets: initialInOctets - Math.floor((baseInBps * 3) / 8),
            currentInOctets: initialInOctets,
            prevOutOctets: initialOutOctets - Math.floor((baseOutBps * 3) / 8),
            currentOutOctets: initialOutOctets,
            inbound_bps: baseInBps,
            outbound_bps: baseOutBps,
            inbound_utilization: inUtil,
            outbound_utilization: outUtil,
            status: 'Normal',
            lastUpdated: new Date().toLocaleTimeString()
          };
        })
      };
    });
    return initial;
  });

  // Keep a ref to current telemetry for synchronous computation
  const telemetryRef = useRef(telemetry);
  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  // Persist thresholds
  useEffect(() => {
    try {
      localStorage.setItem('ndm_snmp_thresholds', JSON.stringify(thresholds));
    } catch (e) {
      console.warn('Error saving thresholds', e);
    }
  }, [thresholds]);

  // Persist sound settings
  useEffect(() => {
    try {
      localStorage.setItem('ndm_snmp_sound', JSON.stringify(soundEnabled));
    } catch (e) {
      console.warn('Error saving sound settings', e);
    }
  }, [soundEnabled]);

  // Persist alerts
  useEffect(() => {
    try {
      localStorage.setItem('ndm_snmp_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.warn('Error saving alerts', e);
    }
  }, [alerts]);

  // Helper to construct a standardized alert object
  const createAlertObject = (device, iface, currentUtil, severity) => {
    const alertId = `ALT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90 + 10)}`;
    const timestamp = new Date().toLocaleString();
    const formattedUtil = currentUtil.toFixed(1);

    let description = '';
    if (severity === 'Critical') {
      description = `Critical Alert: Bandwidth utilization on ${device.device_name} - ${iface.name} has reached ${formattedUtil}%. A possible network bottleneck has been detected. Administrator investigation is required.`;
    } else {
      description = `Warning: Bandwidth utilization on ${device.device_name} - ${iface.name} has reached ${formattedUtil}%. Network traffic is approaching the configured limit.`;
    }

    return {
      id: alertId,
      timestamp,
      device_name: device.device_name,
      ip_address: device.ip_address,
      interface_name: iface.name,
      utilization: parseFloat(formattedUtil),
      severity,
      description,
      status: 'Active',
      acknowledgedAt: null,
      resolvedAt: null,
      adminDecision: null // 'not_resolved' | 'resolved' | null
    };
  };

  // Pure function to compute next telemetry and identify alert transitions
  const computeTelemetryCycle = (currentTelemetry, mode, interval, currentThresholds) => {
    const nextTelemetry = {};
    const newAlerts = [];
    const nowTimeStr = new Date().toLocaleTimeString();

    Object.keys(currentTelemetry).forEach(devId => {
      const dev = currentTelemetry[devId];

      const updatedInterfaces = dev.interfaces.map(iface => {
        const speed = iface.speed;
        const deltaT = interval;

        // Calculate target traffic based on simulation mode and device
        let targetInRatio = 0.25;
        let targetOutRatio = 0.30;

        const jitterIn = (Math.random() * 0.06) - 0.03;
        const jitterOut = (Math.random() * 0.06) - 0.03;

        if (mode === 'normal') {
          targetInRatio = Math.max(0.12, Math.min(0.48, 0.28 + jitterIn));
          targetOutRatio = Math.max(0.15, Math.min(0.50, 0.32 + jitterOut));
        } else if (mode === 'warning') {
          if (dev.device_name === 'Core Switch' && iface.name.includes('Trunk to Dist-01')) {
            targetInRatio = 0.78 + jitterIn; // ~78%
            targetOutRatio = 0.55 + jitterOut;
          } else if (dev.device_name === 'Distribution Switch 01' && iface.name.includes('Downlink Acc-01')) {
            targetInRatio = 0.76 + jitterIn; // ~76%
            targetOutRatio = 0.60 + jitterOut;
          } else {
            targetInRatio = 0.25 + jitterIn;
            targetOutRatio = 0.30 + jitterOut;
          }
        } else if (mode === 'critical') {
          if (dev.device_name === 'Main Router' && iface.name.includes('WAN')) {
            targetInRatio = 0.62 + jitterIn;
            targetOutRatio = 0.93 + jitterOut; // ~93% CRITICAL BOTTLENECK
          } else if (dev.device_name === 'Application Server' && iface.name.includes('Backup')) {
            targetInRatio = 0.89 + jitterIn; // ~89% CRITICAL
            targetOutRatio = 0.42 + jitterOut;
          } else if (dev.device_name === 'Core Switch' && iface.name.includes('Trunk to Dist-01')) {
            targetInRatio = 0.81 + jitterIn; // Warning spillover
            targetOutRatio = 0.60 + jitterOut;
          } else {
            targetInRatio = 0.30 + jitterIn;
            targetOutRatio = 0.35 + jitterOut;
          }
        }

        const targetInBps = Math.max(100_000, targetInRatio * speed);
        const targetOutBps = Math.max(100_000, targetOutRatio * speed);

        const deltaInOctets = Math.round((targetInBps * deltaT) / 8);
        const deltaOutOctets = Math.round((targetOutBps * deltaT) / 8);

        const prevInOctets = iface.currentInOctets;
        const currentInOctets = prevInOctets + deltaInOctets;

        const prevOutOctets = iface.currentOutOctets;
        const currentOutOctets = prevOutOctets + deltaOutOctets;

        const calculatedInboundBps = Math.round(((currentInOctets - prevInOctets) * 8) / deltaT);
        const calculatedOutboundBps = Math.round(((currentOutOctets - prevOutOctets) * 8) / deltaT);

        const inboundUtil = Math.round(((calculatedInboundBps / speed) * 100) * 10) / 10;
        const outboundUtil = Math.round(((calculatedOutboundBps / speed) * 100) * 10) / 10;

        const maxUtil = Math.max(inboundUtil, outboundUtil);

        let status = 'Normal';
        if (maxUtil >= currentThresholds.critical) {
          status = 'Critical';
        } else if (maxUtil >= currentThresholds.warning) {
          status = 'Warning';
        }

        // Deduplication check: only alert on transition to a higher state or when first triggered
        const key = `${dev.id}-${iface.name}`;
        const prevStatus = prevInterfaceStatusRef.current[key] || 'Normal';

        if (status !== prevStatus) {
          if (status === 'Critical') {
            newAlerts.push(createAlertObject(dev, iface, maxUtil, 'Critical'));
          } else if (status === 'Warning' && prevStatus !== 'Critical') {
            newAlerts.push(createAlertObject(dev, iface, maxUtil, 'Warning'));
          }
          prevInterfaceStatusRef.current[key] = status;
        }

        return {
          ...iface,
          prevInOctets,
          currentInOctets,
          prevOutOctets,
          currentOutOctets,
          inbound_bps: calculatedInboundBps,
          outbound_bps: calculatedOutboundBps,
          inbound_utilization: inboundUtil,
          outbound_utilization: outboundUtil,
          status,
          lastUpdated: nowTimeStr
        };
      });

      nextTelemetry[devId] = {
        ...dev,
        interfaces: updatedInterfaces
      };
    });

    return { nextTelemetry, newAlerts, nowTimeStr };
  };

  // Main Monitoring Polling Loop
  useEffect(() => {
    if (!isMonitoringActive) return;

    const timer = setInterval(() => {
      const { nextTelemetry, newAlerts, nowTimeStr } = computeTelemetryCycle(
        telemetryRef.current,
        simulationMode,
        pollingInterval,
        thresholds
      );

      setLastPollTime(nowTimeStr);
      setCurrentTimeStep(prev => prev + 1);
      setTelemetry(nextTelemetry);
      telemetryRef.current = nextTelemetry;

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev]);
        if (soundEnabled) {
          playAlertSound(newAlerts[0].severity.toLowerCase());
        }
      }
    }, pollingInterval * 1000);

    return () => clearInterval(timer);
  }, [isMonitoringActive, pollingInterval, simulationMode, thresholds, soundEnabled]);

  // Direct simulation mode switches (instant feedback)
  const applySimulationMode = (mode) => {
    setSimulationMode(mode);

    // Immediately compute and dispatch so all pages reflect changes synchronously
    const { nextTelemetry, newAlerts, nowTimeStr } = computeTelemetryCycle(
      telemetryRef.current,
      mode,
      pollingInterval,
      thresholds
    );

    setLastPollTime(nowTimeStr);
    setCurrentTimeStep(prev => prev + 1);
    setTelemetry(nextTelemetry);
    telemetryRef.current = nextTelemetry;

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
      if (soundEnabled) {
        playAlertSound(newAlerts[0].severity.toLowerCase());
      }
    }
  };

  const resetSimulation = () => {
    setSimulationMode('normal');
    prevInterfaceStatusRef.current = {};

    const { nextTelemetry, nowTimeStr } = computeTelemetryCycle(
      telemetryRef.current,
      'normal',
      pollingInterval,
      thresholds
    );

    setLastPollTime(nowTimeStr);
    setTelemetry(nextTelemetry);
    telemetryRef.current = nextTelemetry;
  };

  // Alert Actions
  const acknowledgeAlert = (alertId) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? { ...a, status: 'Acknowledged', acknowledgedAt: new Date().toLocaleString() }
          : a
      )
    );
  };

  const resolveAlert = (alertId) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? {
              ...a,
              status: 'Resolved',
              resolvedAt: new Date().toLocaleString(),
              adminDecision: 'resolved'
            }
          : a
      )
    );
  };

  const markProblemUnresolved = (alertId) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? {
              ...a,
              status: 'Active',
              adminDecision: 'not_resolved'
            }
          : a
      )
    );
  };

  const clearResolvedAlerts = () => {
    setAlerts(prev => prev.filter(a => a.status !== 'Resolved'));
  };

  const updateThresholds = (newWarning, newCritical) => {
    setThresholds({
      warning: Math.max(10, Math.min(newWarning, newCritical - 1)),
      critical: Math.max(newWarning + 1, Math.min(100, newCritical))
    });
  };

  // Computed summary metrics across all devices & interfaces
  const metrics = useMemo(() => {
    let totalDevices = 0;
    let activeDevices = 0;
    let totalInterfaces = 0;
    let totalUtilSum = 0;
    let highestUtil = 0;
    let mostCongested = { deviceName: 'None', interfaceName: 'None', util: 0, status: 'Normal' };
    let totalInBps = 0;
    let totalOutBps = 0;

    Object.values(telemetry).forEach(dev => {
      totalDevices++;
      let devHasTraffic = false;

      dev.interfaces.forEach(iface => {
        totalInterfaces++;
        totalInBps += iface.inbound_bps;
        totalOutBps += iface.outbound_bps;

        const maxUtil = Math.max(iface.inbound_utilization, iface.outbound_utilization);
        totalUtilSum += maxUtil;

        if (maxUtil > 0) devHasTraffic = true;

        if (maxUtil > highestUtil) {
          highestUtil = maxUtil;
          mostCongested = {
            deviceName: dev.device_name,
            ip: dev.ip_address,
            interfaceName: iface.name,
            util: maxUtil,
            status: iface.status,
            speed: iface.speed
          };
        }
      });

      if (devHasTraffic) activeDevices++;
    });

    const avgUtil = totalInterfaces > 0 ? totalUtilSum / totalInterfaces : 0;

    const activeWarningAlerts = alerts.filter(a => a.severity === 'Warning' && a.status !== 'Resolved').length;
    const activeCriticalAlerts = alerts.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length;

    // Network Health Score (100 - penalties for alerts & congestion)
    let healthScore = 100 - (activeCriticalAlerts * 25) - (activeWarningAlerts * 10);
    if (highestUtil > thresholds.critical) healthScore -= 15;
    else if (highestUtil > thresholds.warning) healthScore -= 8;
    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

    let healthStatus = 'Excellent';
    if (healthScore < 50) healthStatus = 'Critical Bottlenecks Detected';
    else if (healthScore < 80) healthStatus = 'Warning: Traffic Elevated';
    else healthStatus = 'Normal Operations';

    return {
      totalDevices,
      activeDevices,
      totalInterfaces,
      avgUtil: parseFloat(avgUtil.toFixed(1)),
      highestUtil: parseFloat(highestUtil.toFixed(1)),
      mostCongested,
      totalInBps,
      totalOutBps,
      activeWarningAlerts,
      activeCriticalAlerts,
      totalAlerts: alerts.length,
      healthScore,
      healthStatus
    };
  }, [telemetry, alerts, thresholds]);

  const value = {
    telemetry,
    metrics,
    thresholds,
    updateThresholds,
    soundEnabled,
    setSoundEnabled,
    pollingInterval,
    setPollingInterval,
    isMonitoringActive,
    setIsMonitoringActive,
    simulationMode,
    applySimulationMode,
    resetSimulation,
    alerts,
    acknowledgeAlert,
    resolveAlert,
    markProblemUnresolved,
    clearResolvedAlerts,
    currentTimeStep,
    lastPollTime,
    selectedDeviceModal,
    setSelectedDeviceModal
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return ctx;
}
