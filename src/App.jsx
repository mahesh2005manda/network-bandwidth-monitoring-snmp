import React, { useState } from 'react';
import { NetworkProvider, useNetwork } from './context/NetworkContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AlertBanner from './components/AlertBanner';
import DeviceDetailModal from './components/DeviceDetailModal';

// Pages
import NetworkOverview from './pages/NetworkOverview';
import BandwidthMonitoring from './pages/BandwidthMonitoring';
import DeviceMonitoring from './pages/DeviceMonitoring';
import CongestionDetection from './pages/CongestionDetection';
import AlertManagement from './pages/AlertManagement';
import NetworkTopology from './pages/NetworkTopology';
import HowItWorks from './pages/HowItWorks';
import Settings from './pages/Settings';
import PresentationMode from './pages/PresentationMode';

function DashboardContent() {
  const [currentPage, setCurrentPage] = useState('overview');

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <NetworkOverview setCurrentPage={setCurrentPage} />;
      case 'bandwidth':
        return <BandwidthMonitoring />;
      case 'devices':
        return <DeviceMonitoring />;
      case 'congestion':
        return <CongestionDetection setCurrentPage={setCurrentPage} />;
      case 'alerts':
        return <AlertManagement />;
      case 'topology':
        return <NetworkTopology />;
      case 'how-it-works':
        return <HowItWorks />;
      case 'settings':
        return <Settings />;
      case 'presentation':
        return <PresentationMode setCurrentPage={setCurrentPage} />;
      default:
        return <NetworkOverview setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0f1d] text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <Header currentPage={currentPage} />
        <AlertBanner setCurrentPage={setCurrentPage} />
        <main className="flex-1 pb-12">
          {renderPage()}
        </main>
      </div>

      {/* Device Diagnostics Modal */}
      <DeviceDetailModal />
    </div>
  );
}

export default function App() {
  return (
    <NetworkProvider>
      <DashboardContent />
    </NetworkProvider>
  );
}
