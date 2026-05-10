'use client'

import { motion } from 'framer-motion'
import { projects, profile, skills, experience, education } from '@/lib/projects'
import { ExternalLink, Github, Mail, Linkedin, ArrowUp, Headphones, Globe, Gamepad2, BarChart3, Smartphone, Bot, Briefcase, GraduationCap, Award, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface PortfolioSectionProps {
  onBackToOcean: () => void
}

const iconMap = {
  audio: Headphones,
  web: Globe,
  game: Gamepad2,
  data: BarChart3,
  mobile: Smartphone,
  ai: Bot,
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function PortfolioSection({ onBackToOcean }: PortfolioSectionProps) {
  return (
    <section className="relative min-h-screen">
      {/* Full background with smooth ocean-to-sky gradient matching reference */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            #0c2340 0%,
            #0f3a5c 8%,
            #1a5276 15%,
            #2874a6 25%,
            #3498db 40%,
            #5dade2 55%,
            #85c1e9 70%,
            #aed6f1 82%,
            #d6eaf8 92%,
            #ebf5fb 100%
          )`
        }}
      />
      
      {/* Subtle cloudy texture overlay for depth */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(ellipse 70% 60% at 40% 60%, rgba(255,255,255,0.08) 0%, transparent 50%)
          `
        }}
      />
      
      <div className="relative max-w-6xl mx-auto px-4 pt-32 pb-20">
        {/* Back to ocean button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBackToOcean}
          className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm border border-white/50 shadow-lg text-sky-700 hover:text-sky-900 hover:bg-white transition-all"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="text-sm">Back to Ocean</span>
        </motion.button>

        {/* Projects Section - FIRST */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-20"
        >
          <motion.h2 variants={item} className="text-4xl font-bold text-white mb-8 drop-shadow-md">
            Projects
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const Icon = iconMap[project.icon]
              return (
                <motion.div key={project.id} variants={item}>
                  <Card className="h-full bg-white/95 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl hover:bg-white transition-all group">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${project.color}15` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: project.color }} />
                        </div>
                        <CardTitle className="text-lg text-slate-900 group-hover:text-sky-600 transition-colors">
                          {project.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="line-clamp-3 text-slate-600">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      {project.link && (
                        <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600 hover:text-slate-900" asChild>
                          <a href={project.link} target="_blank" rel="noopener noreferrer">
                            <Github className="w-3.5 h-3.5" />
                            Code
                          </a>
                        </Button>
                      )}
                      {project.demoLink && (
                        <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600 hover:text-slate-900" asChild>
                          <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3.5 h-3.5" />
                            Demo
                          </a>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* About Section - SECOND */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-20"
        >
          <motion.h2 variants={item} className="text-4xl font-bold text-white mb-6 drop-shadow-md">
            About Me
          </motion.h2>
          <motion.div variants={item} className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-white/90 leading-relaxed mb-4 drop-shadow-sm">
                I&apos;m {profile.name}, a {profile.title} based in {profile.location}. 
                I&apos;m passionate about building immersive digital experiences that blur the line 
                between art and technology, with expertise in full-stack development, 3D graphics, 
                and creative coding.
              </p>
              <p className="text-white/90 leading-relaxed mb-4 drop-shadow-sm">
                Currently working at Manulife / John Hancock, I build internal platforms, 
                data pipelines, and integrations that serve hundreds of users. My background 
                includes experience at Salesforce and a Computer Science degree from Oberlin College.
              </p>
              <p className="text-white/90 leading-relaxed drop-shadow-sm">
                When I&apos;m not coding, I explore generative art, raymarching, and procedural 
                generation. I&apos;m fluent in French and always excited to connect with fellow creators.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2 drop-shadow-sm">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.languages.map((s) => (
                    <span key={s} className="text-xs px-3 py-1 rounded-full bg-white/90 text-sky-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-2 drop-shadow-sm">Frameworks</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.frameworks.map((s) => (
                    <span key={s} className="text-xs px-3 py-1 rounded-full bg-white/90 text-sky-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-2 drop-shadow-sm">Data & APIs</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.data.map((s) => (
                    <span key={s} className="text-xs px-3 py-1 rounded-full bg-white/90 text-sky-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-2 drop-shadow-sm">Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((s) => (
                    <span key={s} className="text-xs px-3 py-1 rounded-full bg-white/90 text-sky-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Experience Section - THIRD */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-20"
        >
          <motion.h2 variants={item} className="text-4xl font-bold text-white mb-8 flex items-center gap-3 drop-shadow-md">
            <Briefcase className="w-8 h-8 text-white" />
            Experience
          </motion.h2>
          <div className="space-y-6">
            {experience.map((exp, index) => (
              <motion.div key={index} variants={item}>
                <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl text-slate-900">{exp.title}</CardTitle>
                        <CardDescription className="text-base font-medium text-sky-600">
                          {exp.company}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col md:items-end gap-1 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {exp.period}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {exp.location}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-sky-600 mt-1.5">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Education Section - FOURTH */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-20"
        >
          <motion.h2 variants={item} className="text-4xl font-bold text-white mb-8 flex items-center gap-3 drop-shadow-md">
            <GraduationCap className="w-8 h-8 text-white" />
            Education
          </motion.h2>
          <motion.div variants={item}>
            <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl text-slate-900">{education.school}</CardTitle>
                    <CardDescription className="text-base">
                      <span className="font-medium text-slate-900">{education.degree}</span>
                      <span className="text-slate-500"> | Concentration: {education.concentration}</span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col md:items-end gap-1 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {education.graduationDate}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {education.location}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-sky-600" />
                  <span className="text-sm font-medium text-slate-900">Honors & Leadership</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {education.honors.map((honor) => (
                    <span key={honor} className="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      {honor}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.h2 variants={item} className="text-4xl font-bold text-sky-900 mb-4 drop-shadow-sm">
            Let&apos;s Connect
          </motion.h2>
          <motion.p variants={item} className="text-sky-700 mb-8 max-w-md mx-auto">
            Interested in working together? I&apos;m always open to discussing new projects, 
            creative collaborations, and opportunities.
          </motion.p>
          <motion.div variants={item} className="flex justify-center gap-4 flex-wrap">
            <Button variant="outline" size="lg" className="gap-2 bg-white border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300">
              <Mail className="w-4 h-4" />
              Email
            </Button>
            <Button variant="outline" size="lg" className="gap-2 bg-white border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300" asChild>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </Button>
            <Button variant="outline" size="lg" className="gap-2 bg-white border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300" asChild>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-8 border-t border-sky-200/50 text-center text-sm text-sky-700"
        >
          <p>&copy; {new Date().getFullYear()} {profile.name}. Built with passion and Three.js.</p>
        </motion.footer>
      </div>
    </section>
  )
}
