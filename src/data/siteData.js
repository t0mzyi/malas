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
    tagline: 'Enterprise Electrical & Technological Infrastructure',
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
    headline: 'Advanced electrical and technological infrastructure engineered to power the future.',
    subline: 'Malas Electronics LLC specializes in the end-to-end trading, expert implementation, and meticulous maintenance of high-performance audiovisual, robotics, computer, and precision control systems across the UAE.',
    image: ledAuditoriumPhoto,
    imageAlt: 'High-performance curved LED video wall auditorium installation by Malas Electronics LLC'
  },

  about: {
    title: 'The Malas Engineering Standard',
    quote: 'Malas Electronics LLC stands at the forefront of technological innovation, delivering comprehensive solutions designed to power the future.',
    highlight: 'We specialize in the end-to-end trading, expert implementation, and meticulous maintenance of advanced electrical and technological infrastructure.',
    description: 'Our core expertise spans across high-performance audiovisual systems, cutting-edge robotics, computer systems, and precision control systems. We are dedicated to elevating commercial and industrial operations by ensuring your systems operate at their absolute peak of efficiency and reliability.',
    image: loungePhoto,
    imageAlt: 'Malas Electronics executive hospitality and technology showroom in Deira, Dubai'
  },

  services: [
    {
      id: 'audiovisual',
      title: 'High-Performance Audiovisual Systems',
      scope: 'End-to-end trading, acoustic engineering, and turnkey installation for corporate boardrooms, conference centers, hotels, entertainment venues, and education.',
      capabilities: 'MicroLED displays, large-format video walls, multi-zone acoustic sound reinforcement, digital signage, projection systems, and BYOD conferencing.',
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
      title: 'Cutting-Edge Robotics & Automation',
      scope: 'Industrial automation and robotic process integration engineered to elevate operational throughput, reduce overhead, and optimize efficiency.',
      capabilities: 'Industrial robotic arms, automated process engineering, smart factory floor telemetry, IoT sensor networks, and custom PLC programming.',
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
      title: 'Enterprise Computer Systems',
      scope: 'Mission-critical computing infrastructure, high-throughput enterprise networks, resilient storage arrays, and high-performance engineering workstations.',
      capabilities: 'Enterprise server clusters, high-speed fiber routing, NVMe storage fabrics, virtualization, and zero-trust network topologies.',
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
      title: 'Precision Control Systems',
      scope: 'Unified single-pane-of-glass facility automation orchestrating architectural lighting, HVAC climate control, access security, and multi-zone AV.',
      capabilities: 'Custom capacitive touch interfaces, room scheduling, sensor-triggered scene presets, energy management, and building-wide integration.',
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

  process: [
    {
      num: '01',
      title: 'Consult & Audit',
      description: 'Site survey across Dubai and the UAE, infrastructure audit, and comprehensive operational requirement mapping.'
    },
    {
      num: '02',
      title: 'Engineering Design',
      description: 'CAD schematics, single-line diagrams, thermal & acoustic calculations, and transparent hardware BOM procurement.'
    },
    {
      num: '03',
      title: 'Expert Implementation',
      description: 'Certified turnkey installation, structured cable dressing, precision hardware calibration, and user acceptance testing.'
    },
    {
      num: '04',
      title: 'Meticulous Maintenance',
      description: 'Preventative maintenance cycles, rapid-dispatch 24/7 SLA response, and direct access to specialized technicians.'
    }
  ]
};
