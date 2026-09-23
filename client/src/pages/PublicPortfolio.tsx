import { useState, useEffect } from 'react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Card, CardContent } from '../components/ui/card';
import { GitBranch, UserCircle, Mail, ExternalLink, Menu, X, FileText, Download, Share2, Award, Trophy, FolderKanban, ChevronRight, Lock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PublicPortfolio() {
  const { profile, skills, projects, certifications, achievements } = usePortfolioStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Since we don't have a backend visibility state in the prompt specifically for the public page, 
  // we'll assume it's public unless a specific condition is met. The prompt said "If visibility is disabled".
  // We'll add a mock check. For now, it's public.
  const isPublic = true; // In a real app, this would check store or DB

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Portfolio link copied!");
    }).catch(() => {
      toast.info("Copy this portfolio URL to share it with recruiters.");
    });
  };

  const handleDownloadResume = () => {
    // In prototype, we just show a toast since we don't have a real file
    toast.success("Resume download will be available once a resume is uploaded.");
  };

  if (!isPublic) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Lock className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Portfolio Not Available</h1>
        <p className="text-muted-foreground">This student has currently set their portfolio to private.</p>
      </div>
    );
  }

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* 1. PUBLIC PORTFOLIO HEADER */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <div className="bg-primary text-white w-8 h-8 rounded flex items-center justify-center">S</div>
            SkillFolio
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollTo('about')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</button>
            <button onClick={() => scrollTo('skills')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Skills</button>
            <button onClick={() => scrollTo('projects')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Projects</button>
            <button onClick={() => scrollTo('certifications')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Certifications</button>
            <button onClick={() => scrollTo('achievements')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Achievements</button>
            <button onClick={() => scrollTo('contact')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</button>
            
            <div className="h-4 w-px bg-border/50 mx-2"></div>
            
            <Button variant="ghost" size="icon" onClick={handleCopyLink} title="Share"><Share2 className="w-4 h-4" /></Button>
            <Button size="sm" onClick={handleDownloadResume}><Download className="w-4 h-4 mr-2"/> Resume</Button>
          </nav>

          {/* Mobile Nav Toggle */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 left-0 w-full bg-background border-b border-border shadow-lg md:hidden flex flex-col p-4 space-y-4"
            >
              <button onClick={() => scrollTo('about')} className="text-left text-sm font-medium p-2 hover:bg-secondary rounded">About</button>
              <button onClick={() => scrollTo('skills')} className="text-left text-sm font-medium p-2 hover:bg-secondary rounded">Skills</button>
              <button onClick={() => scrollTo('projects')} className="text-left text-sm font-medium p-2 hover:bg-secondary rounded">Projects</button>
              <button onClick={() => scrollTo('certifications')} className="text-left text-sm font-medium p-2 hover:bg-secondary rounded">Certifications</button>
              <button onClick={() => scrollTo('achievements')} className="text-left text-sm font-medium p-2 hover:bg-secondary rounded">Achievements</button>
              <button onClick={() => scrollTo('contact')} className="text-left text-sm font-medium p-2 hover:bg-secondary rounded">Contact</button>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button className="flex-1" onClick={handleDownloadResume}><Download className="w-4 h-4 mr-2"/> Resume</Button>
                <Button variant="outline" onClick={handleCopyLink}><Share2 className="w-4 h-4 mr-2"/> Share</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-32 pb-20 px-6 container mx-auto relative overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex-1 space-y-6"
          >
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-3 py-1 text-sm border-none mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                Open to Opportunities
              </Badge>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground uppercase">
                {profile.fullName}
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-primary">
                {profile.title}
              </h2>
            </div>
            
            <p className="text-xl md:text-2xl font-medium text-muted-foreground leading-relaxed max-w-2xl">
              I build practical digital products and solve real-world problems through technology.
            </p>
            
            <p className="text-muted-foreground leading-relaxed max-w-2xl text-lg">
              {profile.bio}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" onClick={() => scrollTo('projects')} className="h-12 px-8 text-base shadow-lg shadow-primary/20">View My Projects</Button>
              <Button size="lg" variant="outline" onClick={handleDownloadResume} className="h-12 px-8 text-base"><FileText className="w-4 h-4 mr-2"/> Download Resume</Button>
            </div>
            
            <div className="flex items-center gap-4 pt-6">
              <a href={profile.github.includes('http') ? profile.github : '#'} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 hover:text-primary transition-colors">
                <GitBranch className="w-5 h-5" />
              </a>
              <a href={profile.linkedin.includes('http') ? profile.linkedin : '#'} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 hover:text-primary transition-colors">
                <UserCircle className="w-5 h-5" />
              </a>
              <a href={`mailto:${profile.email}`} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
          
          {/* 3. PROFILE / IDENTITY CARD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-[400px]"
          >
            <Card className="border border-border/50 shadow-2xl shadow-primary/5 bg-background/50 backdrop-blur-xl">
              <div className="h-24 bg-gradient-to-r from-primary/80 to-accent/80 rounded-t-xl"></div>
              <CardContent className="px-8 pb-8 pt-0 relative">
                <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center text-3xl font-bold text-primary shadow-xl border-4 border-background -mt-12 mb-6">
                  {profile.fullName.split(' ').map(n => n[0]).join('').substring(0,2)}
                </div>
                <h3 className="text-xl font-bold">{profile.fullName}</h3>
                <p className="text-primary font-medium mb-4">{profile.degree}</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{profile.college}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{profile.location}</span>
                  </div>
                  <div className="flex items-start gap-3 pt-4 border-t border-border/50">
                    <span className="text-sm font-medium">Open to internships, hackathons and software development opportunities.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 5. PORTFOLIO HIGHLIGHTS (Stats) */}
      <section className="py-12 border-y border-border/50 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-black text-primary mb-2">{skills.length}</motion.div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Skills</div>
            </div>
            <div className="text-center">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-black text-foreground mb-2">{projects.length}</motion.div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Projects</div>
            </div>
            <div className="text-center">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-black text-foreground mb-2">{certifications.length}</motion.div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Certifications</div>
            </div>
            <div className="text-center">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-black text-foreground mb-2">{achievements.length}</motion.div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Achievements</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT SECTION */}
      <section id="about" className="py-24 container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-8">About Me</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>{profile.summary || "I'm a Computer Science student interested in software engineering, full-stack development and emerging technologies."}</p>
              <p>I enjoy building practical applications that solve real problems. My experience includes working with modern frontend technologies, backend development, databases and programming languages.</p>
              <p>I'm continuously learning, building projects and participating in technical activities to strengthen both my development and problem-solving skills.</p>
            </div>
          </div>
          <div className="md:w-1/2">
            <Card className="bg-card shadow-sm border-border/50 h-full">
              <CardContent className="p-8 space-y-6">
                <div>
                  <h4 className="text-sm text-muted-foreground font-medium mb-1 uppercase tracking-wider">Education</h4>
                  <p className="font-semibold text-lg">{profile.degree}</p>
                  <p className="text-muted-foreground">{profile.college}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground font-medium mb-1 uppercase tracking-wider">Academic Status</h4>
                  <p className="font-semibold text-lg">{profile.academicYear}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground font-medium mb-1 uppercase tracking-wider">Location</h4>
                  <p className="font-semibold text-lg">{profile.location}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground font-medium mb-3 uppercase tracking-wider">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map(interest => (
                      <Badge key={interest} variant="secondary" className="font-normal bg-secondary/60">{interest}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 8. SKILLS + EVIDENCE (CORE UNIQUE SECTION) */}
      <section id="skills" className="py-24 bg-secondary/20 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Skills Backed by Evidence</h2>
            <p className="text-xl text-muted-foreground">Explore the projects and certifications that demonstrate my skills.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill, index) => {
              const linkedProjects = projects.filter(p => p.relatedSkillIds.includes(skill.id));
              const linkedCerts = certifications.filter(c => c.relatedSkillIds.includes(skill.id));
              const hasEvidence = linkedProjects.length > 0 || linkedCerts.length > 0;

              return (
                <motion.div 
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-border shadow-sm hover:shadow-md transition-shadow bg-background">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-2">{skill.name}</h3>
                        <Badge variant="outline" className="font-normal text-muted-foreground">{skill.level}</Badge>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                            <span>Self-assessed proficiency</span>
                            <span>{skill.progress}%</span>
                          </div>
                          <Progress value={skill.progress} className="h-1.5" />
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-px bg-border flex-1"></div>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Evidence</span>
                          <div className="h-px bg-border flex-1"></div>
                        </div>

                        {hasEvidence ? (
                          <div className="space-y-3">
                            {linkedProjects.map(p => (
                              <div key={p.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                                <FolderKanban className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-sm leading-tight">{p.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">Project</p>
                                </div>
                              </div>
                            ))}
                            {linkedCerts.map(c => (
                              <div key={c.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                                <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-sm leading-tight">{c.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">Certification</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-muted/50 rounded-lg text-center border border-dashed border-border">
                            <p className="text-sm text-muted-foreground">No supporting evidence linked yet.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SKILLS & EXPERTISE (Category Grouping) */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Skills & Expertise</h2>
          <p className="text-lg text-muted-foreground">Technologies and skills I use to build applications.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {Object.entries(groupedSkills).map(([category, catSkills]) => (
            <div key={category}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {catSkills.map(s => (
                  <Badge key={s.id} variant="secondary" className="px-3 py-1.5 text-sm font-medium bg-secondary/60 hover:bg-secondary">
                    {s.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FEATURED PROJECTS */}
      <section id="projects" className="py-24 bg-card border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
            <p className="text-xl text-muted-foreground">A selection of projects I've built and contributed to.</p>
          </div>

          <div className="space-y-16">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Projects will appear here as they are added.</p>
              </div>
            ) : (
              projects.map((project, index) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}
                >
                  <div className="w-full lg:w-1/2">
                    <Card className="overflow-hidden border-none shadow-xl bg-muted/20 group">
                      <div className="relative aspect-video overflow-hidden rounded-xl">
                        <img src={project.image} alt={project.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500" />
                      </div>
                    </Card>
                  </div>
                  <div className="w-full lg:w-1/2 space-y-6">
                    <div>
                      {project.featured && <Badge className="mb-3 bg-primary text-primary-foreground border-none">Featured Project</Badge>}
                      <h3 className="text-3xl font-bold mb-2">{project.title}</h3>
                      <p className="text-primary font-medium">{project.role}</p>
                    </div>
                    
                    <div className="p-6 bg-background rounded-xl border border-border/50 shadow-sm relative">
                      <p className="text-muted-foreground leading-relaxed text-lg">{project.description}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map(tech => (
                          <Badge key={tech} variant="outline" className="font-mono text-xs">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      {project.githubUrl && (
                        <a href={project.githubUrl !== '#' ? project.githubUrl : '#'} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="h-12 px-6"><GitBranch className="w-4 h-4 mr-2" /> GitHub</Button>
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl !== '#' ? project.liveUrl : '#'} target="_blank" rel="noreferrer">
                          <Button className="h-12 px-6"><ExternalLink className="w-4 h-4 mr-2" /> Live Demo</Button>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 11 & 12. CERTIFICATIONS AND ACHIEVEMENTS */}
      <section id="certifications" className="py-24 container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Certifications */}
          <div>
            <h2 className="text-3xl font-bold mb-2">Certifications</h2>
            <p className="text-muted-foreground mb-12">Professional certifications and credentials I've earned.</p>
            
            <div className="space-y-8">
              {certifications.length === 0 ? (
                <p className="text-muted-foreground">No certifications added yet.</p>
              ) : (
                certifications.map(cert => (
                  <div key={cert.id} className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-2rem] last:before:hidden before:w-px before:bg-border">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary/10 border border-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold">{cert.title}</h3>
                          <Badge variant="secondary" className="font-normal bg-secondary">{cert.issueDate}</Badge>
                        </div>
                        <p className="text-lg font-medium text-muted-foreground mb-4">{cert.organization}</p>
                        {cert.credentialId && (
                          <p className="text-sm text-muted-foreground mb-4 font-mono bg-secondary/50 p-2 rounded inline-block">ID: {cert.credentialId}</p>
                        )}
                        <Button variant="ghost" size="sm" className="-ml-3 text-primary" onClick={() => window.open(cert.credentialUrl, '_blank')}>View Credential <ChevronRight className="w-4 h-4 ml-1" /></Button>
                      </CardContent>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Achievements */}
          <div id="achievements">
            <h2 className="text-3xl font-bold mb-2">Achievements</h2>
            <p className="text-muted-foreground mb-12">Competitions, leadership activities and milestones.</p>
            
            <div className="space-y-6">
              {achievements.length === 0 ? (
                <p className="text-muted-foreground">No achievements added yet.</p>
              ) : (
                achievements.map(achievement => (
                  <Card key={achievement.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-row items-stretch">
                    <div className="w-2 bg-accent"></div>
                    <CardContent className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-accent/10 rounded-lg text-accent">
                            <Trophy className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold">{achievement.title}</h3>
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">{achievement.date}</span>
                      </div>
                      <p className="font-medium text-muted-foreground mb-3">{achievement.organization}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{achievement.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            
            {/* 13 & 15. Education & Learning block below achievements */}
            <div className="mt-16 pt-12 border-t border-border">
              <h2 className="text-2xl font-bold mb-6">Education Timeline</h2>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{profile.degree}</h3>
                  <p className="text-lg text-muted-foreground mb-1">{profile.college}</p>
                  <p className="text-muted-foreground">{profile.location}</p>
                  <Badge variant="secondary" className="mt-3 font-normal">Currently pursuing {profile.academicYear}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 16. CONTACT SECTION */}
      <section id="contact" className="py-32 bg-primary text-primary-foreground text-center px-6">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Let's Build Something Together</h2>
          <p className="text-xl text-primary-foreground/80 mb-12">I'm always interested in learning, collaborating and building useful technology.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={`mailto:${profile.email}`} className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full h-14 px-8 text-lg text-primary hover:bg-white/90">
                <Mail className="w-5 h-5 mr-2" /> Email Me
              </Button>
            </a>
            <a href={profile.linkedin.includes('http') ? profile.linkedin : '#'} className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg bg-transparent border-primary-foreground/30 hover:bg-white/10 text-white">
                <UserCircle className="w-5 h-5 mr-2" /> Connect on LinkedIn
              </Button>
            </a>
          </div>
          <p className="mt-8 text-primary-foreground/60">{profile.email}</p>
        </div>
      </section>

      {/* 17. FOOTER */}
      <footer className="bg-background border-t border-border py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="font-bold text-xl tracking-tight text-primary mb-1">SkillFolio</div>
            <p className="text-sm font-medium text-foreground">{profile.fullName}</p>
            <p className="text-xs text-muted-foreground">{profile.title}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <a href={profile.github.includes('http') ? profile.github : '#'} className="text-muted-foreground hover:text-foreground text-sm font-medium">GitHub</a>
            <a href={profile.linkedin.includes('http') ? profile.linkedin : '#'} className="text-muted-foreground hover:text-foreground text-sm font-medium">LinkedIn</a>
            <a href={`mailto:${profile.email}`} className="text-muted-foreground hover:text-foreground text-sm font-medium">Email</a>
          </div>
          
          <div className="text-center md:text-right text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} {profile.fullName}</p>
            <p className="mt-1">Powered by SkillFolio</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
