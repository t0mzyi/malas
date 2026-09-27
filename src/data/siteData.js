import boardroomPhoto from '/assets/13ddf7c1-f818-4a58-a43e-8a3ed334ac2a.jpg';
import controlPhoto from '/assets/369b0432-5c82-4f35-9934-16fb7fda7a0d.jpg';
import ledAuditoriumPhoto from '/assets/9a4a174a-1d44-408b-b184-7ecd0dc9fb68.jpg';
import loungePhoto from '/assets/afbd74af-4933-4754-a92a-02507af31c18.jpg';
import ledShowroomPhoto from '/assets/b49533c4-16cf-4734-abf5-8ba1be5a189b.jpg';
import conferencePhoto from '/assets/c5a95e58-1963-497b-ae31-2f7f8e59d29f.jpg';
import logoImg from '/logo.png';

export const SITE_DATA = {
  company: {
    name: 'Malas Electronics LLC',
    shortName: 'Malas Electronics',
    tagline: 'Enterprise Systems Integrator',
    location: 'Al Muteena, 18B, Deira, Dubai, United Arab Emirates',
    phoneDirect: '+971 50 000 0000',
    phoneLandline: '+971 4 000 0000',
    emailGeneral: 'info@malaselectronics.com',
    emailSales: 'sales@malaselectronics.com',
    hours: 'Saturday–Thursday 9:00 AM–6:00 PM · Friday Closed (Emergency SLA Dispatch Active)',
    coverage: 'Dubai, Abu Dhabi, Sharjah, and Northern Emirates',
    logo: logoImg
  },

  hero: {
    headline: 'Turnkey AV, robotics, IT infrastructure, and building control systems across the UAE.',
    subline: 'Engineering, installation, and 24/7 SLA maintenance for commercial facilities across Dubai, Abu Dhabi, Sharjah, and the Northern Emirates.',
    image: ledAuditoriumPhoto,
    imageAlt: 'Auditorium installation with high-resolution curved LED video wall by Malas Electronics'
  },

  services: [
    {
      id: 'audiovisual',
      title: 'Audiovisual Systems',
      scope: 'Turnkey AV engineering for corporate boardrooms, conference centers, hotels, entertainment venues, and education.',
      capabilities: 'MicroLED displays, video walls, multi-zone acoustic sound reinforcement, digital signage, projection mapping, BYOD conferencing.',
      image: boardroomPhoto,
      imageAlt: 'Boardroom AV installation with presentation display and beamforming mics',
      specs: [
        { label: 'Latency', value: '< 1ms Pro-AV distribution' },
        { label: 'Resolution', value: 'Up to 8K MicroLED modular arrays' },
        { label: 'Protocols', value: 'Dante IP, AES67, NDI, SDVoE' },
        { label: 'Support', value: '24/7 proactive monitoring & maintenance' }
      ]
    },
    {
      id: 'robotics',
      title: 'Robotics & Automation',
      scope: 'Industrial automation and robotic process integration to reduce overhead and improve throughput.',
      capabilities: 'Industrial robotic arms, process automation, smart factory floor telemetry, IoT sensor networks, custom PLC programming.',
      image: controlPhoto,
      imageAlt: 'Industrial control and automation operations workstation',
      specs: [
        { label: 'Repeatability', value: '±0.02mm industrial grade precision' },
        { label: 'Protocols', value: 'Modbus, Profinet, MQTT, OPC-UA' },
        { label: 'Efficiency', value: 'Up to 40% cycle time optimization' },
        { label: 'Safety', value: 'ISO 13849-1 Category 4 / PLe certified' }
      ]
    },
    {
      id: 'it-infrastructure',
      title: 'Computer Systems & Infrastructure',
      scope: 'Mission-critical IT networks, storage arrays, servers, and high-performance engineering workstations.',
      capabilities: 'Enterprise server clusters, high-speed fiber routing, NVMe storage fabrics, zero-trust network topologies.',
      image: conferencePhoto,
      imageAlt: 'Enterprise telepresence and digital collaboration suite',
      specs: [
        { label: 'Network fabric', value: '10G/40G/100G multi-mode & single-mode fiber' },
        { label: 'Redundancy', value: 'N+1 hot-swappable failover' },
        { label: 'Deployment', value: 'Rack-scale turnkey with cable management' },
        { label: 'Security', value: 'Hardware firewall & zero-trust perimeter' }
      ]
    },
    {
      id: 'control-systems',
      title: 'Control Systems',
      scope: 'Single-pane-of-glass facility automation for lighting, HVAC, access security, and AV.',
      capabilities: 'Custom capacitive touch interfaces, room scheduling, sensor-triggered scene presets, building-wide automation.',
      image: ledShowroomPhoto,
      imageAlt: 'Experience center architectural curved LED installation',
      specs: [
        { label: 'Interfaces', value: '7", 10.1", 15.6" IPS flush-mount capacitive panels' },
        { label: 'Ecosystems', value: 'Crestron, Q-SYS, Extron, AMX' },
        { label: 'Protocols', value: 'BACnet, KNX, DALI, Modbus, IP' },
        { label: 'Access', value: 'Wall panels, motorized tablets, secure mobile apps' }
      ]
    }
  ],

  about: {
    title: 'The Malas Engineering Standard',
    quote: 'We engineer systems that run with uninterrupted precision, specified and installed by hardware specialists.',
    description: 'Operating out of Al Muteena, Deira, Malas Electronics LLC delivers turnkey technology installations for luxury commercial, government, and hospitality environments across the UAE. We work with the world\'s leading hardware manufacturers, calibrate every component to exact acoustic and electrical tolerances, and back all systems with dedicated SLA support.',
    image: loungePhoto,
    imageAlt: 'Malas Electronics VIP executive facility and AV lounge in Dubai'
  },

  process: [
    {
      num: '01',
      title: 'Consult',
      description: 'Site survey in Dubai/UAE, space audit, objective mapping.'
    },
    {
      num: '02',
      title: 'Design',
      description: 'CAD schematics, single-line diagrams, thermal & acoustic calculations, transparent BOM.'
    },
    {
      num: '03',
      title: 'Build',
      description: 'Certified installation, clean cable dressing, hardware calibration, user acceptance testing.'
    },
    {
      num: '04',
      title: 'Support',
      description: 'Preventative maintenance cycles, SLA response, direct access to technicians.'
    }
  ]
};
