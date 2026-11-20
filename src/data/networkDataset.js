import networkDataRaw from '../../network_data.json';

export const rawDataset = networkDataRaw;
export const metadata = networkDataRaw.metadata;
export const historicalRecords = networkDataRaw.records;

/**
 * Standard MIB-II Interface Group OIDs for SNMP v1 (RFC 1213 / RFC 2863)
 */
export const SNMP_MIB_DEFINITIONS = [
  {
    name: 'ifIndex',
    oid: '1.3.6.1.2.1.2.2.1.1',
    syntax: 'INTEGER',
    access: 'read-only',
    description: 'A unique value for each interface. Its value ranges between 1 and the value of ifNumber.'
  },
  {
    name: 'ifDescr',
    oid: '1.3.6.1.2.1.2.2.1.2',
    syntax: 'DisplayString',
    access: 'read-only',
    description: 'A textual string containing information about the interface (e.g., GigabitEthernet0/0).'
  },
  {
    name: 'ifType',
    oid: '1.3.6.1.2.1.2.2.1.3',
    syntax: 'INTEGER',
    access: 'read-only',
    description: 'The type of interface, distinguished according to physical/data-link protocol (e.g. ethernetCsmacd(6)).'
  },
  {
    name: 'ifSpeed',
    oid: '1.3.6.1.2.1.2.2.1.5',
    syntax: 'Gauge32',
    access: 'read-only',
    description: 'An estimate of the interface\'s current bandwidth in bits per second (e.g., 100,000,000 for 100M, 1,000,000,000 for 1G).'
  },
  {
    name: 'ifPhysAddress',
    oid: '1.3.6.1.2.1.2.2.1.6',
    syntax: 'PhysAddress',
    access: 'read-only',
    description: 'The interface\'s address at the protocol sub-layer immediately below the network layer (MAC address).'
  },
  {
    name: 'ifOperStatus',
    oid: '1.3.6.1.2.1.2.2.1.8',
    syntax: 'INTEGER',
    access: 'read-only',
    description: 'The current operational state of the interface: up(1), down(2), testing(3).'
  },
  {
    name: 'ifInOctets',
    oid: '1.3.6.1.2.1.2.2.1.10',
    syntax: 'Counter32',
    access: 'read-only',
    description: 'The total number of octets (bytes) received on the interface, including framing characters (cumulative 32-bit counter).'
  },
  {
    name: 'ifOutOctets',
    oid: '1.3.6.1.2.1.2.2.1.16',
    syntax: 'Counter32',
    access: 'read-only',
    description: 'The total number of octets (bytes) transmitted out of the interface, including framing characters (cumulative 32-bit counter).'
  }
];

/**
 * 8 Monitored Devices and their topology configurations
 */
export const DEVICE_METADATA = [
  {
    id: 'dev-1',
    device_name: 'Main Router',
    role: 'Gateway / WAN Edge Router',
    ip_address: '192.168.1.1',
    mac_address: '00:1A:2B:3C:4D:01',
    device_type: 'Router',
    location: 'Data Center Rack A01',
    uptime: '142 days, 18 hours, 32 mins',
    snmp_version: 'SNMPv1 (RFC 1157)',
    interfaces: [
      { name: 'GigabitEthernet0/0 (WAN)', speed: 100_000_000, role: 'WAN Uplink to ISP', duplex: 'Full Duplex' },
      { name: 'GigabitEthernet0/1 (LAN Core Uplink)', speed: 1_000_000_000, role: 'LAN Trunk to Core Switch', duplex: 'Full Duplex' }
    ]
  },
  {
    id: 'dev-2',
    device_name: 'Core Switch',
    role: 'Enterprise Backbone Switch',
    ip_address: '192.168.1.2',
    mac_address: '00:1A:2B:3C:4D:02',
    device_type: 'Switch',
    location: 'Data Center Rack A02',
    uptime: '89 days, 04 hours, 12 mins',
    snmp_version: 'SNMPv1 (RFC 1157)',
    interfaces: [
      { name: 'GigabitEthernet1/0/1 (Uplink to Router)', speed: 1_000_000_000, role: 'Uplink from Main Router', duplex: 'Full Duplex' },
      { name: 'GigabitEthernet1/0/2 (Trunk to Dist-01)', speed: 1_000_000_000, role: 'Trunk to Distribution Switch 01', duplex: 'Full Duplex' },
      { name: 'GigabitEthernet1/0/3 (Trunk to Dist-02)', speed: 1_000_000_000, role: 'Trunk to Distribution Switch 02', duplex: 'Full Duplex' }
    ]
  },
  {
    id: 'dev-3',
    device_name: 'Distribution Switch 01',
    role: 'Building A Aggregation Switch',
    ip_address: '192.168.1.3',
    mac_address: '00:1A:2B:3C:4D:03',
    device_type: 'Switch',
    location: 'Building A IDF Closet',
    uptime: '56 days, 11 hours, 45 mins',
    snmp_version: 'SNMPv1 (RFC 1157)',
    interfaces: [
      { name: 'GigabitEthernet0/1 (Uplink Core)', speed: 1_000_000_000, role: 'Uplink to Core Switch', duplex: 'Full Duplex' },
      { name: 'FastEthernet0/1 (Downlink Acc-01)', speed: 100_000_000, role: 'Downlink to Access Switch 01', duplex: 'Full Duplex' }
    ]
  },
  {
    id: 'dev-4',
    device_name: 'Distribution Switch 02',
    role: 'Building B Aggregation Switch',
    ip_address: '192.168.1.4',
    mac_address: '00:1A:2B:3C:4D:04',
    device_type: 'Switch',
    location: 'Building B IDF Closet',
    uptime: '56 days, 11 hours, 40 mins',
    snmp_version: 'SNMPv1 (RFC 1157)',
    interfaces: [
      { name: 'GigabitEthernet0/1 (Uplink Core)', speed: 1_000_000_000, role: 'Uplink to Core Switch', duplex: 'Full Duplex' },
      { name: 'FastEthernet0/1 (Downlink Acc-02)', speed: 100_000_000, role: 'Downlink to Access Switch 02', duplex: 'Full Duplex' }
    ]
  },
  {
    id: 'dev-5',
    device_name: 'Access Switch 01',
    role: 'App Server Pod Switch',
    ip_address: '192.168.1.5',
    mac_address: '00:1A:2B:3C:4D:05',
    device_type: 'Switch',
    location: 'Server Room Pod 1',
    uptime: '45 days, 08 hours, 10 mins',
    snmp_version: 'SNMPv1 (RFC 1157)',
    interfaces: [
      { name: 'FastEthernet0/1 (Uplink Dist-01)', speed: 100_000_000, role: 'Uplink to Dist Switch 01', duplex: 'Full Duplex' },
      { name: 'GigabitEthernet0/1 (Server Link App)', speed: 1_000_000_000, role: 'Direct Link to Application Server', duplex: 'Full Duplex' }
    ]
  },
  {
    id: 'dev-6',
    device_name: 'Access Switch 02',
    role: 'DB Server Pod Switch',
    ip_address: '192.168.1.6',
    mac_address: '00:1A:2B:3C:4D:06',
    device_type: 'Switch',
    location: 'Server Room Pod 2',
    uptime: '45 days, 08 hours, 05 mins',
    snmp_version: 'SNMPv1 (RFC 1157)',
    interfaces: [
      { name: 'FastEthernet0/1 (Uplink Dist-02)', speed: 100_000_000, role: 'Uplink to Dist Switch 02', duplex: 'Full Duplex' },
      { name: 'GigabitEthernet0/1 (Server Link DB)', speed: 1_000_000_000, role: 'Direct Link to Database Server', duplex: 'Full Duplex' }
    ]
  },
  {
    id: 'dev-7',
    device_name: 'Application Server',
    role: 'Primary Production Application Host',
    ip_address: '192.168.1.50',
    mac_address: '00:1A:2B:3C:4D:50',
    device_type: 'Server',
    location: 'Server Room Pod 1, Node 4',
    uptime: '22 days, 14 hours, 20 mins',
    snmp_version: 'SNMPv1 (RFC 1157)',
    interfaces: [
      { name: 'eth0 (Production Web/App)', speed: 1_000_000_000, role: 'HTTP/HTTPS Ingress & Service Mesh', duplex: 'Full Duplex' },
      { name: 'eth1 (Management / Backup)', speed: 100_000_000, role: 'Disaster Recovery & Backup Trunk', duplex: 'Full Duplex' }
    ]
  },
  {
    id: 'dev-8',
    device_name: 'Database Server',
    role: 'Primary PostgreSQL Database Cluster',
    ip_address: '192.168.1.60',
    mac_address: '00:1A:2B:3C:4D:60',
    device_type: 'Server',
    location: 'Server Room Pod 2, Node 2',
    uptime: '38 days, 02 hours, 14 mins',
    snmp_version: 'SNMPv1 (RFC 1157)',
    interfaces: [
      { name: 'eth0 (Database Engine Port)', speed: 1_000_000_000, role: 'SQL Query Processing & Replication', duplex: 'Full Duplex' }
    ]
  }
];

/**
 * Network Topology Model for SVG Visualization
 * Hierarchy:
 * Internet -> Main Router -> Core Switch -> Distribution Switches -> Access Switches -> Servers
 */
export const TOPOLOGY_NODES = [
  { id: 'internet', label: 'Internet / WAN', type: 'cloud', x: 50, y: 8, ip: '203.0.113.1', deviceName: 'External ISP Gateway' },
  { id: 'dev-1', label: 'Main Router', type: 'router', x: 50, y: 22, ip: '192.168.1.1', deviceName: 'Main Router' },
  { id: 'dev-2', label: 'Core Switch', type: 'core_switch', x: 50, y: 40, ip: '192.168.1.2', deviceName: 'Core Switch' },
  { id: 'dev-3', label: 'Dist Switch 01', type: 'switch', x: 28, y: 58, ip: '192.168.1.3', deviceName: 'Distribution Switch 01' },
  { id: 'dev-4', label: 'Dist Switch 02', type: 'switch', x: 72, y: 58, ip: '192.168.1.4', deviceName: 'Distribution Switch 02' },
  { id: 'dev-5', label: 'Access Switch 01', type: 'switch', x: 28, y: 76, ip: '192.168.1.5', deviceName: 'Access Switch 01' },
  { id: 'dev-6', label: 'Access Switch 02', type: 'switch', x: 72, y: 76, ip: '192.168.1.6', deviceName: 'Access Switch 02' },
  { id: 'dev-7', label: 'App Server', type: 'server', x: 28, y: 92, ip: '192.168.1.50', deviceName: 'Application Server' },
  { id: 'dev-8', label: 'DB Server', type: 'server', x: 72, y: 92, ip: '192.168.1.60', deviceName: 'Database Server' }
];

export const TOPOLOGY_LINKS = [
  { source: 'internet', target: 'dev-1', interfaceName: 'GigabitEthernet0/0 (WAN)', deviceName: 'Main Router', speed: '100 Mbps' },
  { source: 'dev-1', target: 'dev-2', interfaceName: 'GigabitEthernet0/1 (LAN Core Uplink)', deviceName: 'Main Router', speed: '1 Gbps' },
  { source: 'dev-2', target: 'dev-3', interfaceName: 'GigabitEthernet1/0/2 (Trunk to Dist-01)', deviceName: 'Core Switch', speed: '1 Gbps' },
  { source: 'dev-2', target: 'dev-4', interfaceName: 'GigabitEthernet1/0/3 (Trunk to Dist-02)', deviceName: 'Core Switch', speed: '1 Gbps' },
  { source: 'dev-3', target: 'dev-5', interfaceName: 'FastEthernet0/1 (Downlink Acc-01)', deviceName: 'Distribution Switch 01', speed: '100 Mbps' },
  { source: 'dev-4', target: 'dev-6', interfaceName: 'FastEthernet0/1 (Downlink Acc-02)', deviceName: 'Distribution Switch 02', speed: '100 Mbps' },
  { source: 'dev-5', target: 'dev-7', interfaceName: 'GigabitEthernet0/1 (Server Link App)', deviceName: 'Access Switch 01', speed: '1 Gbps' },
  { source: 'dev-6', target: 'dev-8', interfaceName: 'GigabitEthernet0/1 (Server Link DB)', deviceName: 'Access Switch 02', speed: '1 Gbps' }
];
