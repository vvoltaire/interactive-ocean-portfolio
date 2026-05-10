export interface ProjectObject {
  id: string
  name: string
  type: 'card' | 'platform' | 'icon' | 'marker'
  position: [x: number, y: number, z: number]
  description: string
  shortDescription: string
  techStack: string[]
  links: Array<{ label: string; url: string }>
  visual: {
    modelUrl?: string
    color?: string
    icon?: string
    scale?: number
  }
}

export const projectsData: ProjectObject[] = [
  {
    id: 'project-1',
    name: 'Audio Visualizer',
    type: 'card',
    position: [-15, 2, -25],
    description: 'Real-time audio visualization built with Web Audio API and Canvas. Responds to frequency data with dynamic particle effects.',
    shortDescription: 'Web Audio visualization with particle effects',
    techStack: ['Web Audio API', 'Canvas', 'JavaScript'],
    links: [
      { label: 'Demo', url: '#' },
      { label: 'Code', url: '#' },
    ],
    visual: {
      color: '#6366f1',
      scale: 1,
    },
  },
  {
    id: 'project-2',
    name: 'Interactive Web App',
    type: 'platform',
    position: [15, 1.5, -20],
    description: 'Full-stack web application with React frontend and Node.js backend. Features real-time data synchronization and responsive design.',
    shortDescription: 'React + Node.js full-stack application',
    techStack: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    links: [
      { label: 'Demo', url: '#' },
      { label: 'Code', url: '#' },
    ],
    visual: {
      color: '#0ea5e9',
      scale: 1.2,
    },
  },
  {
    id: 'project-3',
    name: 'Game Project',
    type: 'icon',
    position: [0, 1.8, 15],
    description: '3D browser-based game built with Three.js. Features procedural terrain generation, physics simulation, and interactive gameplay.',
    shortDescription: 'Three.js 3D game with procedural generation',
    techStack: ['Three.js', 'Physics', 'WebGL'],
    links: [
      { label: 'Play', url: '#' },
      { label: 'Code', url: '#' },
    ],
    visual: {
      color: '#ec4899',
      scale: 1,
    },
  },
  {
    id: 'project-4',
    name: 'Data Dashboard',
    type: 'marker',
    position: [-20, 2.2, 10],
    description: 'Interactive data visualization dashboard. Real-time charts, filters, and analytics with D3.js and custom React components.',
    shortDescription: 'D3.js data visualization dashboard',
    techStack: ['React', 'D3.js', 'TypeScript', 'Tailwind'],
    links: [
      { label: 'Dashboard', url: '#' },
      { label: 'Code', url: '#' },
    ],
    visual: {
      color: '#f59e0b',
      scale: 1,
    },
  },
  {
    id: 'project-5',
    name: 'Design System',
    type: 'card',
    position: [20, 1.6, 5],
    description: 'Comprehensive component library and design system. Documented with Storybook, featuring accessibility-first design principles.',
    shortDescription: 'React component library & design system',
    techStack: ['React', 'Storybook', 'TypeScript', 'CSS-in-JS'],
    links: [
      { label: 'Storybook', url: '#' },
      { label: 'Code', url: '#' },
    ],
    visual: {
      color: '#8b5cf6',
      scale: 1.1,
    },
  },
]
