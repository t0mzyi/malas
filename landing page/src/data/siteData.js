export const SITE_DATA = {
  company: {
    name: 'Malas Electronics LLC',
    shortName: 'Malas Electronics',
    brandMark: 'MALA',
    tagline: 'Premier Audio-Visual Systems Integrator & Event Technology',
    location: 'Al Muteena, 18B, Deira, Dubai, United Arab Emirates',
    phoneDirect: '+971 50 000 0000',
    phoneLandline: '+971 4 000 0000',
    emailGeneral: 'info@malaselectronics.com',
    emailSales: 'sales@malaselectronics.com',
    hours: 'Saturday–Thursday 9:00 AM–6:00 PM · Friday Closed (Emergency SLA Dispatch Active)',
    coverage: 'Dubai, Abu Dhabi, Sharjah, and Northern Emirates',
    logo: '/logo.png',
    whatWeDo: 'Malas Electronics LLC is an authorized systems integrator specializing in end-to-end Audio-Visual (AV) engineering, commercial audio setups, LED video walls, live streaming production, smart meeting room automation, and turnkey event technology across the UAE.'
  },

  hero: {
    badge: 'Audio-Visual Systems Integrator & Event Technology',
    headline: 'Next-Generation Audio-Visual Engineering & Turnkey Experiences.',
    subline: 'Malas Electronics LLC specializes in professional audio setup, ultra-HD LED video walls, live broadcast production, smart meeting room automation, and comprehensive event support across Dubai and the UAE.',
    image: '/images/hero-auditorium.jpg',
    imageAlt: 'High-performance curved LED video wall auditorium installation by Malas Electronics LLC',
    stats: [
      { value: '500+', label: 'AV Projects Delivered' },
      { value: '15+', label: 'Years UAE Experience' },
      { value: '10', label: 'Specialized AV Disciplines' },
      { value: '24/7', label: 'Emergency SLA Dispatch' }
    ],
    capabilities: [
      'Audio Setup & Acoustics',
      'Visual & LED Video Walls',
      'Video Production & Live Stream',
      'Stage & Event Lighting',
      'Smart Meeting Rooms',
      '24/7 Maintenance & Support'
    ]
  },

  // 10 Core AV Activities (Client Specified)
  activities: [
    {
      id: 'audio-setup',
      num: '01',
      title: 'Audio Setup',
      subtitle: 'Microphones, speakers, mixers, amplifiers',
      description: 'End-to-end professional acoustic engineering and high-fidelity sound reinforcement. We specify, tune, and deploy Dante-networked digital audio systems tailored for crystal-clear speech and immersive acoustics.',
      equipmentList: [
        'Wireless microphones & beamforming ceiling mic arrays',
        'Line array sound reinforcement & discreet architectural speakers',
        'Digital DSP mixing consoles with Dante / AES67 IP protocols',
        'High-efficiency multi-channel power amplifiers'
      ],
      image: '/images/hero-auditorium.jpg',
      imageAlt: 'Professional line array audio setup in grand auditorium',
      specs: [
        { label: 'Protocols', value: 'Dante IP, AES67, AVB & Milan' },
        { label: 'Acoustics', value: 'DSP auto-mixing & feedback suppression' },
        { label: 'Distribution', value: 'Multi-zone low-latency network audio' },
        { label: 'Hardware', value: 'Shure, Sennheiser, Bose, Q-SYS, Yamaha' }
      ]
    },
    {
      id: 'visual-setup',
      num: '02',
      title: 'Visual Setup',
      subtitle: 'Projectors, LED walls, displays, video walls',
      description: 'Stunning visual display engineering delivering ultra-high resolution and vivid color accuracy. From seamless curved MicroLED displays to ultra-narrow bezel commercial video walls and 4K laser projection.',
      equipmentList: [
        'Curved & flat ultra-fine pitch MicroLED video walls (0.9mm - 1.5mm)',
        'Ultra-high lumen 4K laser projection & ambient light rejecting screens',
        'Ultra-narrow bezel commercial video wall matrix displays',
        'High-brightness 24/7 commercial 4K/8K displays'
      ],
      image: '/images/commercial-audio-signage.jpg',
      imageAlt: 'Commercial visual setup with LED columns and video walls',
      specs: [
        { label: 'Resolution', value: 'Up to 8K HDR seamless modular arrays' },
        { label: 'Brightness', value: 'Up to 10,000 nits high-visibility' },
        { label: 'Bezel Gap', value: '0.88mm ultra-narrow to 0.00mm seamless LED' },
        { label: 'Hardware', value: 'Samsung, LG, Sony, Barco, Christie' }
      ]
    },
    {
      id: 'video-production',
      num: '03',
      title: 'Video Production',
      subtitle: 'Cameras, recording, live streaming',
      description: 'Broadcast-grade multi-camera production suites designed for corporate broadcasts, live events, executive town halls, and virtual webinars with seamless IP-based video routing.',
      equipmentList: [
        'Robotic 4K PTZ tracking cameras with optical zoom',
        'Live broadcast video switchers & vision mixers',
        'Dedicated multi-channel hardware recording decks',
        'Low-latency hardware streaming encoders & teleprompter setups'
      ],
      image: '/images/live-streaming-studio.jpg',
      imageAlt: 'Broadcast video production and live streaming studio',
      specs: [
        { label: 'Video In/Out', value: '12G-SDI, HDMI 2.1, NDI|HX & SMPTE 2110' },
        { label: 'Live Stream', value: 'Multi-platform simultaneous RTMP/SRT broadcast' },
        { label: 'Recording', value: 'ISO multi-cam 4K ProRes & H.265' },
        { label: 'Control', value: 'Automated AI tracking & joystick PTZ control' }
      ]
    },
    {
      id: 'lighting',
      num: '04',
      title: 'Lighting',
      subtitle: 'Stage and event lighting',
      description: 'Architectural and theatrical lighting design engineered to evoke atmosphere and highlight presenters. Complete DMX and Art-Net network integration with motorized fixtures and intuitive scene programming.',
      equipmentList: [
        'Motorized moving head beam, spot, and wash fixtures',
        'LED stage wash bars & architectural wall grazers',
        'Key lighting, fresnels & soft profiles for video presenters',
        'DMX512 / Art-Net lighting consoles & automated touch presets'
      ],
      image: '/images/event-stage-lighting.jpg',
      imageAlt: 'Stage and event lighting with motorized fixtures and beams',
      specs: [
        { label: 'Control Protocol', value: 'DMX512, Art-Net, sACN & Wireless DMX' },
        { label: 'Color Engine', value: 'RGBW + Warm White + Amber LED mixing' },
        { label: 'Automation', value: 'Preset scene recall linked to room modes' },
        { label: 'Safety', value: 'Certified aluminum box trussing & rigging' }
      ]
    },
    {
      id: 'presentation-systems',
      num: '05',
      title: 'Presentation Systems',
      subtitle: 'PowerPoint, digital signage, interactive displays',
      description: 'Frictionless presentation ecosystems enabling speakers to present PowerPoint, interactive dashboards, and multimedia content effortlessly with wireless BYOD connectivity.',
      equipmentList: [
        'Interactive 4K multi-touch displays (65", 75", 86")',
        'Wireless screen sharing systems (AirPlay, Miracast, Google Cast)',
        'Digital presentation annotation whiteboards & smart lecterns',
        'Multi-format matrix presentation switchers with zero-frame latency'
      ],
      image: '/images/classroom-training-av.jpg',
      imageAlt: 'Interactive presentation system in executive training room',
      specs: [
        { label: 'Touch Points', value: '20-point multi-touch with zero parallax' },
        { label: 'Latency', value: '< 1ms instant wireless screen mirroring' },
        { label: 'BYOD', value: 'Cross-platform iOS, Android, Windows, macOS' },
        { label: 'Connectivity', value: 'USB-C single cable audio/video/touch/power' }
      ]
    },
    {
      id: 'event-support',
      num: '06',
      title: 'Event Support',
      subtitle: 'Conferences, seminars, exhibitions, corporate events',
      description: 'Full-spectrum on-site technical coordination, AV operation, and engineering management for high-stakes corporate summits, exhibitions, and live conferences across the UAE.',
      equipmentList: [
        'Dedicated on-site sound engineers, video technicians & lighting operators',
        'Real-time stage management, presenter cueing & audio mixing',
        'Redundant hardware backup systems for zero-failure tolerance',
        'Fast-response setup, testing, rehearsal & tear-down teams'
      ],
      image: '/images/event-stage-lighting.jpg',
      imageAlt: 'Live corporate event support and stage management',
      specs: [
        { label: 'Venues', value: 'Hotels, convention centers, outdoor pavilions' },
        { label: 'Redundancy', value: 'Seamless hot-swap backup video & mic feeds' },
        { label: 'Support SLA', value: 'On-site technical director throughout event' },
        { label: 'Coverage', value: 'Dubai, Abu Dhabi, Sharjah & Northern Emirates' }
      ]
    },
    {
      id: 'installation-maintenance',
      num: '07',
      title: 'Installation & Maintenance',
      subtitle: 'Installing and troubleshooting AV equipment',
      description: 'Precision physical installation, meticulous structured cable dressing, acoustic alignment, and long-term preventative maintenance contracts to guarantee 99.9% uptime.',
      equipmentList: [
        'Turnkey equipment rack fabrication & structured cable combing',
        'Precision mounting of displays, LED tiles, speakers & projectors',
        'Acoustic room tuning & digital system calibration',
        'Scheduled preventative maintenance visits & 24/7 rapid SLA response'
      ],
      image: '/images/av-equipment-rack.jpg',
      imageAlt: 'Immaculate AV equipment rack installation and cabling',
      specs: [
        { label: 'Response Time', value: '< 2-hour emergency on-site dispatch' },
        { label: 'Standards', value: 'Avixa CTS-D & CTS-I certified installation' },
        { label: 'Health Check', value: 'Thermal, firmware & signal path diagnostics' },
        { label: 'SLA Tiers', value: 'Comprehensive 24/7/365 maintenance contracts' }
      ]
    },
    {
      id: 'video-conferencing',
      num: '08',
      title: 'Video Conferencing',
      subtitle: 'Zoom/Teams/Google Meet room systems',
      description: 'Certified native unified communications room systems designed for effortless one-touch join, studio-quality audio capture, and AI-powered optical speaker framing.',
      equipmentList: [
        'Native Zoom Rooms, Microsoft Teams Rooms & Google Meet consoles',
        'All-in-one smart video bars & modular 4K PTZ camera systems',
        'Acoustic Echo Cancellation (AEC) & intelligent beamtracking mics',
        'Dual-screen setups for simultaneous attendee & presentation view'
      ],
      image: '/images/conference-boardroom.jpg',
      imageAlt: 'Executive video conferencing boardroom system',
      specs: [
        { label: 'Platforms', value: 'Microsoft Teams, Zoom Rooms, Google Meet, Cisco' },
        { label: 'One-Touch', value: 'Direct calendar integration & 1-touch meeting start' },
        { label: 'AI Features', value: 'Intelligent speaker tracking & group framing' },
        { label: 'Acoustics', value: 'Full duplex audio with AI background noise removal' }
      ]
    },
    {
      id: 'digital-signage',
      num: '09',
      title: 'Digital Signage',
      subtitle: 'Content management and display systems',
      description: 'Centralized commercial display networks and cloud-hosted CMS for impactful visual communication in corporate lobbies, retail showrooms, luxury hotels, and transport hubs.',
      equipmentList: [
        'Centralized cloud-based Content Management System (CMS)',
        'Ultra-bright 700-1000 nit commercial displays & portrait totems',
        'Interactive touch wayfinding kiosks & outdoor weatherproof LED screens',
        'Hardware media players with failover storage and remote scheduling'
      ],
      image: '/images/commercial-audio-signage.jpg',
      imageAlt: 'Digital signage pillars and video displays in commercial atrium',
      specs: [
        { label: 'CMS Cloud', value: 'Remote scheduling, multi-zone layout & playback sync' },
        { label: 'Duty Cycle', value: '24/7 commercial continuous operation rating' },
        { label: 'Orientation', value: 'Landscape, portrait, video wall & custom aspect ratios' },
        { label: 'Telemetry', value: 'Automated health monitoring & instant display alerts' }
      ]
    },
    {
      id: 'smart-meeting-rooms',
      num: '10',
      title: 'Smart Meeting Rooms',
      subtitle: 'Integrated control systems and room automation',
      description: 'Unified single-touch room automation orchestrating audiovisual routing, motorized privacy glass, DALI lighting presets, and HVAC climate control through sleek touch interfaces.',
      equipmentList: [
        'Capacitive in-wall and tabletop touch control panels',
        'Crestron / Q-SYS / Extron centralized control processors',
        'Motorized shades, blackout drapes & PDLC smart switchable glass',
        'Occupancy sensors & automated room booking scheduling displays'
      ],
      image: '/images/smart-room-automation.jpg',
      imageAlt: 'Smart meeting room with touch automation panel and conference setup',
      specs: [
        { label: 'Touch Panels', value: '7", 10.1", 15.6" flush capacitive IPS screens' },
        { label: 'Automation', value: 'One-touch "Presentation", "Video Call", "Off" scenes' },
        { label: 'Protocols', value: 'BACnet, KNX, DALI, Modbus, IP & RS-232/485' },
        { label: 'Sensory', value: 'Auto-power down upon zero room occupancy' }
      ]
    }
  ],

  // 15 AV Company Projects (Client Specified)
  projects: [
    {
      id: 'conference-room-av',
      number: '01',
      title: 'Conference Room AV System',
      category: 'Corporate',
      scope: 'Enterprise boardrooms and high-stakes executive conference rooms.',
      description: 'Turnkey conference room AV engineered with dual 4K commercial displays, beamforming ceiling mic tiles, digital audio matrix, and tabletop touch control.',
      includedEquipment: 'Dual 4K displays, ceiling beamforming mics, DSP matrix, touch controller, USB-C BYOD dock',
      image: '/images/conference-boardroom.jpg',
      imageAlt: 'Corporate conference room AV system installation',
      tags: ['Corporate', 'Dual 4K', 'Beamforming Audio', 'Touch Control']
    },
    {
      id: 'auditorium-av',
      number: '02',
      title: 'Auditorium AV Installation',
      category: 'Venues & Stages',
      scope: 'Large-scale auditoriums, convention halls, and university amphitheaters.',
      description: 'Massive seamless curved MicroLED video wall, concert-grade line array sound reinforcement, speech reinforcement microphones, and multi-zone stage lighting.',
      includedEquipment: 'Curved MicroLED wall, suspended line array speakers, wireless lavaliers, digital audio console, stage trussing',
      image: '/images/hero-auditorium.jpg',
      imageAlt: 'Auditorium AV installation with curved LED video wall',
      tags: ['Large Venue', 'Curved MicroLED', 'Line Arrays', 'Stage Lighting']
    },
    {
      id: 'digital-signage-networks',
      number: '03',
      title: 'Digital Signage',
      category: 'Commercial',
      scope: 'Commercial headquarters, shopping destinations, hotels, and transit hubs.',
      description: 'High-brightness commercial digital signage columns, interactive wayfinding kiosks, and centralized cloud CMS enabling scheduled visual campaigns.',
      includedEquipment: '700-nit commercial screens, cloud CMS player, interactive directory kiosks, remote health monitoring',
      image: '/images/commercial-audio-signage.jpg',
      imageAlt: 'Digital signage network in commercial atrium',
      tags: ['Commercial', 'Cloud CMS', 'Wayfinding', '24/7 Displays']
    },
    {
      id: 'video-wall',
      number: '04',
      title: 'Video Wall',
      category: 'Enterprise & Commercial',
      scope: 'Corporate lobbies, monitoring hubs, and flagship retail environments.',
      description: 'Seamless ultra-narrow bezel and direct-view LED video walls delivering ultra-high impact architectural visuals with multi-window video processing.',
      includedEquipment: 'Direct-view LED tiles / 0.88mm video wall panels, 4K matrix video processor, custom mounting framework',
      image: '/images/commercial-audio-signage.jpg',
      imageAlt: 'Video wall system installation',
      tags: ['Direct-View LED', 'Ultra-Narrow Bezel', 'Multi-Window', 'Continuous Duty']
    },
    {
      id: 'classroom-av',
      number: '05',
      title: 'Classroom AV System',
      category: 'Education & Training',
      scope: 'Universities, colleges, corporate academies, and training centers.',
      description: 'Interactive smart whiteboards, voice-lift ceiling speakers, lecture capture cameras, and wireless student screen casting for hybrid education.',
      includedEquipment: '86" interactive touch screen, laser projector, ceiling speech reinforcement, PTZ lecture capture camera',
      image: '/images/classroom-training-av.jpg',
      imageAlt: 'University classroom AV installation',
      tags: ['Education', 'Interactive Touch', 'Lecture Capture', 'Voice Lift']
    },
    {
      id: 'corporate-meeting-room',
      number: '06',
      title: 'Corporate Meeting Room',
      category: 'Corporate',
      scope: 'Huddle rooms, department meeting spaces, and hybrid work zones.',
      description: 'Streamlined video meeting spaces equipped with 1-touch meeting start, smart video bars, AI speaker tracking, and concealed cable management.',
      includedEquipment: '4K all-in-one video bar, AI auto-framing, table touch controller, flush table cable cubbies',
      image: '/images/smart-room-automation.jpg',
      imageAlt: 'Corporate meeting room setup with smart conference video bar',
      tags: ['Corporate', 'One-Touch Join', 'AI Framing', 'Video Bar']
    },
    {
      id: 'live-streaming-setup',
      number: '07',
      title: 'Live Streaming Setup',
      category: 'Media & Production',
      scope: 'Broadcast studios, corporate town halls, and virtual event spaces.',
      description: 'Multi-camera PTZ broadcast system with hardware vision mixer, low-latency streaming encoders, studio lighting grid, and acoustic wall treatment.',
      includedEquipment: '4K robotic PTZ cameras, broadcast switcher, multi-platform streaming encoder, studio softboxes, acoustic panels',
      image: '/images/live-streaming-studio.jpg',
      imageAlt: 'Professional live streaming and studio setup',
      tags: ['Broadcast', '4K PTZ', 'Live Switching', 'Multi-Stream']
    },
    {
      id: 'event-stage-av',
      number: '08',
      title: 'Event & Stage AV Setup',
      category: 'Venues & Stages',
      scope: 'Live concert venues, corporate galas, exhibitions, and award shows.',
      description: 'Heavy-duty trussing, motorized moving head beam lights, concert line arrays, high-output subwoofers, and digital stage mixing consoles.',
      includedEquipment: 'Aluminum stage trussing, moving-head spotlights, stage LED screen, digital stage snake, concert audio line arrays',
      image: '/images/event-stage-lighting.jpg',
      imageAlt: 'Event and stage AV setup with dynamic lighting',
      tags: ['Live Events', 'Stage Lighting', 'Concert Sound', 'Trussing']
    },
    {
      id: 'control-room',
      number: '09',
      title: 'Control Room',
      category: 'Enterprise & Security',
      scope: 'Security operations (SOC), network operations (NOC), and traffic control.',
      description: 'Mission-critical panoramic matrix video wall, KVM-over-IP operator workstations, redundant signal routing, and 24/7 continuous operation reliability.',
      includedEquipment: 'Panoramic video wall, KVM over IP matrix, multi-screen operator consoles, redundant UPS power',
      image: '/images/mission-control-room.jpg',
      imageAlt: 'Mission critical 24/7 operations control room video wall',
      tags: ['Mission-Critical', 'NOC / SOC', 'KVM Over IP', 'Redundant Power']
    },
    {
      id: 'smart-room-automation',
      number: '10',
      title: 'Smart Room Automation',
      category: 'Automation',
      scope: 'Executive suites, smart boardrooms, and intelligent buildings.',
      description: 'Unified single-pane touch automation consolidating lighting scenes, motorized window blinds, climate control, and AV routing into one interface.',
      includedEquipment: 'Wall-mounted capacitive touch panels, smart relay processors, DALI lighting controllers, motorized shade motors',
      image: '/images/smart-room-automation.jpg',
      imageAlt: 'Smart room automation touch panel control',
      tags: ['Automation', 'Touch Screen', 'Motorized Shades', 'DALI Lighting']
    },
    {
      id: 'gaming-room-setup',
      number: '11',
      title: 'Gaming Room Setup',
      category: 'Luxury Residential',
      scope: 'High-end residential villas, esports training centers, and VIP lounges.',
      description: 'Ultimate immersive gaming environments featuring custom gaming PCs/consoles, multi-panel OLED displays, Dolby Atmos surround sound, and reactive RGB ambient illumination.',
      includedEquipment: 'High-performance gaming PCs/consoles, triple curved OLED displays, studio surround sound monitors, acoustic wood slats, 10G low-latency networking',
      image: '/images/gaming-room-setup.jpg',
      imageAlt: 'Luxury high-end gaming room setup with triple curved displays',
      tags: ['Gaming', 'Triple OLED', 'Dolby Atmos', 'RGB Illumination', 'Low-Latency']
    },
    {
      id: 'cinema-theatre-av',
      number: '12',
      title: 'Cinema / Theatre AV System',
      category: 'Venues & Luxury',
      scope: 'Commercial cinemas, private screening rooms, and VIP auditoriums.',
      description: 'DCI-compliant cinema projector, large acoustically transparent screen, multi-channel immersive surround sound, comprehensive acoustic treatment, and full theatre automation.',
      includedEquipment: 'Cinema projector, large micro-perforated screen, Dolby Atmos surround sound arrays, acoustic wall treatment, automated theatre controls',
      image: '/images/luxury-home-cinema.jpg',
      imageAlt: 'Dedicated cinema and theatre AV system installation',
      tags: ['Cinema', 'Large Screen', 'Dolby Atmos', 'Acoustic Treatment', 'Theatre Automation']
    },
    {
      id: 'home-theatre',
      number: '13',
      title: 'Home Theatre',
      category: 'Luxury Residential',
      scope: 'Private residential villas, penthouses, and bespoke media rooms.',
      description: 'Bespoke home cinema with 4K laser projector or flagship OLED TV, multi-channel AV receiver, surround speakers, dual subwoofers, precision acoustic treatment, and smart app control.',
      includedEquipment: '4K laser projector / OLED TV, multi-channel AV receiver, surround sound speakers, active subwoofer, acoustic paneling, smart controls',
      image: '/images/luxury-home-cinema.jpg',
      imageAlt: 'Bespoke luxury home theatre with starlight ceiling',
      tags: ['Home Theatre', 'Laser Projector / TV', 'Surround Sound', 'Subwoofer', 'Smart Controls']
    },
    {
      id: 'home-audio-system',
      number: '14',
      title: 'Home Audio System',
      category: 'Luxury Residential',
      scope: 'Whole-villa audio distribution, luxury residences, and garden sound.',
      description: 'Architectural flush-mount ceiling and wall speakers, multi-zone music distribution, and discrete multi-channel amplifiers delivering synchronized music throughout the home.',
      includedEquipment: 'Multi-room ceiling speakers, multi-zone audio streaming matrix, discrete amplification, mobile app volume controls',
      image: '/images/smart-room-automation.jpg',
      imageAlt: 'Multi-room home audio and architectural speaker integration',
      tags: ['Multi-Room', 'Ceiling Speakers', 'Music Distribution', 'Hi-Res Audio']
    },
    {
      id: 'commercial-audio-system',
      number: '15',
      title: 'Commercial Audio System',
      category: 'Commercial',
      scope: 'Corporate offices, 5-star hotels, luxury retail shops, and dining venues.',
      description: 'Multi-zone background music (BGM) and public-address (PA) announcement systems with voice evacuation override, paging microphones, and discrete architectural sound.',
      includedEquipment: 'Multi-zone background music servers, PA paging microphones, 70V/100V line transformer speakers, ambient noise compensation sensors',
      image: '/images/commercial-audio-signage.jpg',
      imageAlt: 'Commercial background audio and public address system',
      tags: ['Commercial Audio', 'Background Music', 'Public Address (PA)', 'Multi-Zone']
    }
  ],

  about: {
    title: 'The Malas AV Engineering Standard',
    quote: 'Engineered for pristine acoustics, flawless visuals, and zero-downtime execution.',
    highlight: 'Malas Electronics LLC is Dubai’s premier Audio-Visual (AV) systems integrator, turning complex architectural spaces into inspiring, high-performance technological environments.',
    description: 'From enterprise boardrooms and auditoriums to immersive private theatres, live stages, and commercial public address systems, our certified engineers deliver complete turnkey solutions: acoustic consulting, CAD schematics, hardware procurement, certified installation, and 24/7 preventative maintenance SLAs across the UAE.',
    image: '/images/hero-auditorium.jpg',
    imageAlt: 'Malas Electronics landmark audio-visual installation'
  },

  process: [
    {
      num: '01',
      title: 'Acoustic & AV Audit',
      description: 'Comprehensive on-site site survey across Dubai and the UAE, spatial acoustic modeling, light ambient testing, and operational workflow mapping.'
    },
    {
      num: '02',
      title: 'Engineering & CAD Design',
      description: 'Single-line wiring diagrams, signal flow schematics, speaker dispersion heatmaps, CAD rack elevation, and authorized tier-1 brand hardware procurement.'
    },
    {
      num: '03',
      title: 'Turnkey Installation & Tuning',
      description: 'Certified hardware rigging, structured cable dressing, Dante audio network configuration, DSP equalization, and rigorous user acceptance testing.'
    },
    {
      num: '04',
      title: '24/7 SLA & Event Operations',
      description: 'Preventative maintenance cycles, rapid-dispatch emergency support, firmware telemetry, and direct on-site live event technical crew.'
    }
  ]
};
