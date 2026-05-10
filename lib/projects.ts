export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  link?: string
  demoLink?: string
  position: [number, number, number]
  color: string
  icon: 'audio' | 'web' | 'game' | 'data' | 'mobile' | 'ai'
}

// Vinsline Voltaire's GitHub pinned projects
// Positioned across the ocean for a floating horizon effect
export const projects: Project[] = [
  {
    id: 'startpage',
    title: 'Startpage',
    description: 'A visual start-page for creative people drowning in inspiration. The app transforms scattered inspiration, tabs, saved links, tutorials, references, media, and ideas into a spatial, visual environment.',
    tags: ['TypeScript', 'React', 'Visual Design', 'Productivity'],
    link: 'https://github.com/vvoltaire/startpage',
    position: [-8, 0, -8],
    color: '#4ecdc4',
    icon: 'web',
  },
  {
    id: 'interactive-ocean-portfolio',
    title: 'Interactive Ocean Portfolio',
    description: 'An immersive 3D portfolio experience built with Three.js featuring realistic ocean water simulation, dynamic sky with clouds, and floating interactive elements.',
    tags: ['TypeScript', 'Three.js', 'React', 'WebGL'],
    link: 'https://github.com/vvoltaire/interactive-ocean-portfolio',
    position: [0, 0, -12],
    color: '#6c5ce7',
    icon: 'web',
  },
  {
    id: 'latent-fractal-zoom',
    title: 'Latent Fractal Zoom',
    description: 'An exploration of infinite fractal zooms generated through latent space interpolation, creating mesmerizing visual journeys through mathematical structures.',
    tags: ['TypeScript', 'WebGL', 'GLSL', 'Generative Art'],
    link: 'https://github.com/vvoltaire/latent-fractal-zoom',
    position: [8, 0, -8],
    color: '#ff6b6b',
    icon: 'ai',
  },
  {
    id: 'raymarcher-studio',
    title: 'Raymarcher Studio',
    description: 'A real-time raymarching environment for creating and exploring signed distance function (SDF) based 3D scenes with custom shaders and visual effects.',
    tags: ['TypeScript', 'GLSL', 'Raymarching', 'SDF'],
    link: 'https://github.com/vvoltaire/raymarcher-studio',
    position: [-5, 0, 2],
    color: '#ffd93d',
    icon: 'game',
  },
  {
    id: 'procedural-infinite-city',
    title: 'Procedural Infinite City',
    description: 'A procedurally generated infinite cityscape that creates endless urban environments in real-time using algorithmic generation techniques.',
    tags: ['TypeScript', 'Three.js', 'Procedural Generation', 'WebGL'],
    link: 'https://github.com/vvoltaire/procedural-infinite-city',
    position: [5, 0, 2],
    color: '#a29bfe',
    icon: 'game',
  },
  {
    id: 'audio-reactive-camera',
    title: 'Audio Reactive Camera',
    description: 'A creative tool that synchronizes camera movements and visual effects to audio input, creating dynamic visualizations that respond to music and sound.',
    tags: ['TypeScript', 'Web Audio API', 'Three.js', 'Creative Coding'],
    link: 'https://github.com/vvoltaire/audio-reactive-camera',
    position: [12, 0, -4],
    color: '#00cec9',
    icon: 'audio',
  },
]

// Profile information
export const profile = {
  name: 'Vinsline Voltaire',
  title: 'Full-Stack Software Engineer',
  location: 'Boston, MA',
  linkedin: 'https://linkedin.com/in/vvoltaire/',
  github: 'https://github.com/vvoltaire',
}

export const skills = {
  languages: ['Python', 'Java', 'C', 'C++', 'JavaScript', 'TypeScript'],
  frameworks: ['React', 'Node.js', 'Three.js', 'Next.js'],
  data: ['SQL', 'Snowflake', 'PostgreSQL', 'JSON', 'REST APIs'],
  tools: ['Git', 'Docker', 'Azure Kubernetes Service (AKS)', 'Tableau', 'New Relic', 'MySQL', 'Figma'],
  other: ['French (Fluent)'],
}

export const experience = [
  {
    title: 'Associate Full-Stack Software Engineer',
    company: 'Manulife / John Hancock',
    location: 'Boston, MA',
    period: 'Jun 2025 – Present',
    highlights: [
      'Built a full-stack internal platform for hackathon judging across Boston and Toronto, supporting 31 projects, 13 executive-level judges, and over 300 participants, using React, SQL, and Kubernetes (AKS) with real-time scoring, persistent storage, and secure authentication',
      'Developed Python scripts to process 18,477 physician records for a one-time ETL migration from Beacon to Salesforce Health Cloud, performing data cleaning, normalization, and validation to ensure accurate physician visibility in downstream claims management workflows',
      'Implemented Python-based address normalization logic to process 49,261 records, handling complex edge cases including multi-line parsing, unit and building metadata extraction, and field misalignment in real-world datasets',
      'Developed internal REST API services for the Vitality VIC system, enabling structured access to normalized data and supporting system-to-system communication',
      'Built a MuleSoft integration in Anypoint Studio using Java and Python to orchestrate REST API calls and automate data flow between SFHC and CSC systems',
      'Configured New Relic APM monitoring, alerting, and dashboards, reducing incident response time by 40%',
    ],
  },
  {
    title: 'Data and Strategy Intern',
    company: 'Salesforce',
    location: 'Indianapolis, IN',
    period: 'May 2024 – Aug 2024',
    highlights: [
      'Built Tableau dashboards with custom SQL queries to visualize performance metrics across 50+ datasets',
      'Developed SQL pipelines in Snowflake to query 10M+ records, optimizing performance by 50%',
      'Designed an AI automation solution as a pitch competition finalist, creating system architecture and data flow diagrams',
      'Analyzed performance data to identify critical bottlenecks and recommend system optimizations',
    ],
  },
  {
    title: 'Computer Laboratory Assistant',
    company: 'Oberlin College',
    location: 'Oberlin, OH',
    period: 'Jan 2024 – May 2024',
    highlights: [
      'Provided technical assistance to over 400 students enrolled in rigorous Java and Python programming courses',
      'Ensured successful completion and understanding of coding assignments, increasing pass rates by 30%',
      'Developed and delivered structured lesson support for core CS concepts including object-oriented design, recursion, and debugging methodology across Java and Python',
    ],
  },
]

export const education = {
  school: 'Oberlin College',
  location: 'Oberlin, OH',
  degree: 'Computer Science',
  concentration: 'Data Science',
  graduationDate: 'May 2025',
  honors: [
    'Grace Hopper Scholar',
    'Salesforce AI Pitch Competition Finalist',
    'Forbes Under 30 Scholar',
    'John F. Oberlin Scholarship',
    'Bonner Scholar',
    'Ashby Business Scholar',
  ],
}
