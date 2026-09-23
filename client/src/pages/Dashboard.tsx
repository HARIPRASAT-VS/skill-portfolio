import { useState, useEffect } from 'react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Code2, FolderKanban, Award, Trophy, ChevronDown, CheckCircle2, Circle, AlertTriangle, ArrowRight, Activity, Copy, Plus, FileCode2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const CHART_COLORS = ['#4f46e5', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export default function Dashboard() {
  const data = usePortfolioStore();
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(data.profile.isPublic !== false); // default to true if undefined

  useEffect(() => {
    if (data.profile.isPublic !== undefined) {
      setIsPublic(data.profile.isPublic);
    }
  }, [data.profile.isPublic]);

  const handleToggleVisibility = async (checked: boolean) => {
    setIsPublic(checked);
    try {
      await data.updateProfile({ isPublic: checked });
      toast.success(checked ? "Portfolio is now public" : "Portfolio is now private");
    } catch (error) {
      setIsPublic(!checked);
      toast.error("Failed to update visibility");
    }
  };

  const handleCopyLink = () => {
    const username = (data.profile.fullName || 'User').split(' ')[0].toLowerCase();
    navigator.clipboard.writeText(`${window.location.origin}/portfolio/${username}`);
    toast.success("Portfolio link copied!");
  };

  if (!data.analytics) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { analytics, profile, skills, projects } = data;
  const username = (profile.fullName || 'User').split(' ')[0];

  const chartData = analytics.skillsByCategory || [];
  
  // Calculate category progress
  const categoryProgress = (analytics.skillsByCategory || []).map(cat => {
    const skillsInCategory = skills.filter(s => s.category === cat.name);
    const avg = skillsInCategory.length > 0 
      ? skillsInCategory.reduce((sum, s) => sum + s.progress, 0) / skillsInCategory.length 
      : 0;
    return { name: cat.name, progress: Math.round(avg) };
  }).sort((a, b) => b.progress - a.progress);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. DASHBOARD HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">Dashboard</h1>
          <h2 className="text-xl font-semibold mb-1">Good morning, {username} 👋</h2>
          <p className="text-muted-foreground">Keep your skills, projects, certifications and achievements organized in one professional portfolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/portfolio/${username.toLowerCase()}`}>
            <Button variant="outline" className="shadow-sm">View Public Portfolio</Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Add <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/dashboard/skills?action=add')}><Code2 className="w-4 h-4 mr-2"/> Add Skill</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/projects?action=add')}><FolderKanban className="w-4 h-4 mr-2"/> Add Project</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/certifications?action=add')}><Award className="w-4 h-4 mr-2"/> Add Certification</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/achievements?action=add')}><Trophy className="w-4 h-4 mr-2"/> Add Achievement</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left/Main Column - spans 2 on XL */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* 2. PORTFOLIO STRENGTH */}
          <motion.div variants={item}>
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative flex-shrink-0 flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-secondary" />
                      <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * analytics.portfolioStrength) / 100} className="text-primary transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{analytics.portfolioStrength}%</span>
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-xl font-bold mb-2">Portfolio Strength</h3>
                    <p className="text-muted-foreground text-sm mb-6">Your portfolio is looking strong. Complete the remaining items to improve your profile.</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        {analytics.portfolioStrengthBreakdown.profile.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-muted-foreground"/>} Profile
                      </div>
                      <div className="flex items-center gap-2">
                        {analytics.portfolioStrengthBreakdown.skills.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-muted-foreground"/>} Skills
                      </div>
                      <div className="flex items-center gap-2">
                        {analytics.portfolioStrengthBreakdown.projects.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-muted-foreground"/>} Projects
                      </div>
                      <div className="flex items-center gap-2">
                        {analytics.portfolioStrengthBreakdown.certifications.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-muted-foreground"/>} Certifications
                      </div>
                      <div className="flex items-center gap-2">
                        {analytics.portfolioStrengthBreakdown.achievements.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-muted-foreground"/>} Achievements
                      </div>
                      <div className="flex items-center gap-2">
                        {analytics.portfolioStrengthBreakdown.resume.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-muted-foreground"/>} Resume
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-3 mt-2">
                        {!analytics.portfolioStrengthBreakdown.evidence.complete ? (
                          <><AlertTriangle className="w-4 h-4 text-amber-500"/> Skill Evidence (Needs improvement)</>
                        ) : (
                          <><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Skill Evidence (Optimized)</>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button variant="secondary" size="sm" onClick={() => document.getElementById('recommendations')?.scrollIntoView({behavior: 'smooth'})}>Improve Portfolio</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 3. PORTFOLIO STATISTICS */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border/50 bg-card/50 shadow-sm hover:border-primary/20 transition-colors cursor-pointer group" onClick={() => navigate('/dashboard/skills')}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:scale-110 transition-transform"><Code2 className="w-5 h-5"/></div>
                  <span className="text-2xl font-bold">{analytics.totalSkills}</span>
                </div>
                <h4 className="font-semibold mb-1">Skills</h4>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 shadow-sm hover:border-primary/20 transition-colors cursor-pointer group" onClick={() => navigate('/dashboard/projects')}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-accent/10 p-2 rounded-lg text-accent group-hover:scale-110 transition-transform"><FolderKanban className="w-5 h-5"/></div>
                  <span className="text-2xl font-bold">{analytics.totalProjects}</span>
                </div>
                <h4 className="font-semibold mb-1">Projects</h4>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 shadow-sm hover:border-primary/20 transition-colors cursor-pointer group" onClick={() => navigate('/dashboard/certifications')}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-600 group-hover:scale-110 transition-transform"><Award className="w-5 h-5"/></div>
                  <span className="text-2xl font-bold">{analytics.totalCertifications}</span>
                </div>
                <h4 className="font-semibold mb-1">Certifications</h4>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 shadow-sm hover:border-primary/20 transition-colors cursor-pointer group" onClick={() => navigate('/dashboard/achievements')}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-600 group-hover:scale-110 transition-transform"><Trophy className="w-5 h-5"/></div>
                  <span className="text-2xl font-bold">{analytics.totalAchievements}</span>
                </div>
                <h4 className="font-semibold mb-1">Achievements</h4>
              </CardContent>
            </Card>
          </motion.div>

          {/* 4 & 5. SKILLS OVERVIEW & DISTRIBUTION */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <Card className="border-border/50 bg-card/50 shadow-sm h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Skills Overview</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigate('/dashboard/skills')}>View All Skills</Button>
                </CardHeader>
                <CardContent className="space-y-5 pt-4">
                  {categoryProgress.slice(0, 5).map(cat => (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-muted-foreground">{cat.name}</span>
                        <span className="font-bold">{cat.progress}%</span>
                      </div>
                      <Progress value={cat.progress} className="h-2" />
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground text-center pt-2 uppercase tracking-wider">Self-assessed proficiency</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-border/50 bg-card/50 shadow-sm h-full flex flex-col">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">Skill Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center min-h-[250px] relative pt-6 pb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-4">
                    <span className="text-2xl font-bold text-foreground">{analytics.totalSkills}</span>
                    <span className="text-xs text-muted-foreground font-medium">Skills</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 6. SKILLS + EVIDENCE (Signature Feature) */}
          <motion.div variants={item}>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Skills & Evidence</h3>
              <p className="text-muted-foreground text-sm">Show how your skills are supported by real projects and certifications.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {skills.slice(0, 4).map(skill => {
                const linkedProjects = projects.filter(p => p.relatedSkillIds && (p.relatedSkillIds || []).includes(skill.id));
                const linkedCerts = data.certifications.filter(c => c.relatedSkillIds && (c.relatedSkillIds || []).includes(skill.id));
                const hasEvidence = linkedProjects.length > 0 || linkedCerts.length > 0;

                return (
                  <Card key={skill.id} className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">{skill.name}</h4>
                          <Badge variant="outline" className="mt-1 font-normal text-xs">{skill.level}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigate('/dashboard/skills')}>View Skill</Button>
                      </div>
                      
                      <div className="space-y-1.5 mb-6">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Self-assessed proficiency</span>
                          <span className="font-bold">{skill.progress}%</span>
                        </div>
                        <Progress value={skill.progress} className="h-1.5 bg-secondary" />
                      </div>

                      <div className="mt-auto">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Evidence</h5>
                        {hasEvidence ? (
                          <div className="space-y-2">
                            {linkedProjects.slice(0, 2).map(p => (
                              <div key={p.id} className="flex items-center justify-between text-sm bg-secondary/40 rounded-md p-2">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <FileCode2 className="w-4 h-4 text-primary shrink-0" />
                                  <span className="truncate font-medium">{p.title}</span>
                                </div>
                                <span className="text-xs text-muted-foreground ml-2">Project</span>
                              </div>
                            ))}
                            {linkedCerts.slice(0, 2).map(c => (
                              <div key={c.id} className="flex items-center justify-between text-sm bg-secondary/40 rounded-md p-2">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                                  <span className="truncate font-medium">{c.title}</span>
                                </div>
                                <span className="text-xs text-muted-foreground ml-2">Certificate</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 p-3 rounded-md border border-amber-200 dark:border-amber-900/50 flex flex-col items-start gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <AlertTriangle className="w-4 h-4" /> No supporting evidence yet
                            </div>
                            <Button variant="outline" size="sm" className="h-7 text-xs bg-white dark:bg-background border-amber-200 hover:bg-amber-50 hover:text-amber-700" onClick={() => navigate('/dashboard/projects?action=add')}>Add Evidence</Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>

          {/* 7. FEATURED PROJECTS */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4 mt-6">
              <h3 className="text-xl font-bold">Featured Projects</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/projects')}>View All</Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {projects.filter(p => p.featured).slice(0, 3).map(project => (
                <Card key={project.id} className="border-border/50 bg-card/50 shadow-sm overflow-hidden group cursor-pointer" onClick={() => navigate('/dashboard/projects')}>
                  <div className="h-32 overflow-hidden relative">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  </div>
                  <CardContent className="p-4 relative z-10 -mt-10">
                    <Badge className="bg-amber-500 hover:bg-amber-600 mb-2 shadow-sm border-none">Featured</Badge>
                    <h4 className="font-bold mb-1 truncate">{project.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded font-medium text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {projects.filter(p => p.featured).length === 0 && (
                <Card className="border-border/50 bg-card/50 shadow-sm col-span-3 border-dashed">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                    <p className="font-medium mb-1">No featured projects yet.</p>
                    <p className="text-sm text-muted-foreground mb-4">Showcase your work and demonstrate your skills.</p>
                    <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/projects?action=add')}>Add Your First Project</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>

        </div>

        {/* Right Column - spans 1 on XL */}
        <div className="space-y-6">
          
          {/* 14. PUBLIC PORTFOLIO PROMOTION */}
          <motion.div variants={item}>
            <Card className="bg-gradient-to-br from-primary to-accent text-white shadow-md border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-1">Your portfolio is ready to share 🚀</h3>
                <p className="text-white/80 text-sm mb-5">Show recruiters and mentors what you've built.</p>
                <div className="flex flex-col gap-2">
                  <Link to={`/portfolio/${username.toLowerCase()}`} className="w-full">
                    <Button variant="secondary" className="w-full text-primary hover:bg-white/90">View Public Portfolio</Button>
                  </Link>
                  <Button variant="outline" className="w-full bg-transparent border-white/30 text-white hover:bg-white/10" onClick={handleCopyLink}>
                    <Copy className="w-4 h-4 mr-2" /> Copy Portfolio Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 15. RECRUITER VISIBILITY */}
          <motion.div variants={item}>
            <Card className="border-border/50 bg-card/50 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Public Visibility</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isPublic ? 'Visible to anyone with the link' : 'Private to you only'}
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={handleToggleVisibility} className="data-[state=checked]:bg-emerald-500" />
              </CardContent>
            </Card>
          </motion.div>

          {/* 11. RECOMMENDATIONS */}
          <motion.div variants={item} id="recommendations">
            <Card className="border-border/50 bg-card/50 shadow-sm border-primary/20">
              <CardHeader className="pb-3 bg-primary/5 rounded-t-xl border-b border-primary/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" /> Recommended Next Steps
                </CardTitle>
                <CardDescription className="text-xs">Small improvements can make your portfolio more complete.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {(analytics.recommendations || []).slice(0, 4).map(rec => (
                    <div key={rec.id} className="p-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm text-foreground mb-1">💡 {rec.title}</p>
                          <p className="text-xs text-muted-foreground">{rec.message}</p>
                        </div>
                      </div>
                      <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-primary" onClick={() => navigate(rec.actionLink)}>
                        {rec.actionText} <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                  {(analytics.recommendations || []).length === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      Your portfolio is completely optimized! Great job.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 12. COMPLETENESS CHECKLIST */}
          <motion.div variants={item}>
            <Card className="border-border/50 bg-card/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Portfolio Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {analytics.portfolioStrengthBreakdown.profile.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />} Profile information
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {analytics.portfolioStrengthBreakdown.skills.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />} 8+ Skills
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {analytics.portfolioStrengthBreakdown.projects.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />} 4+ Projects
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {analytics.portfolioStrengthBreakdown.certifications.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />} 3+ Certifications
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {analytics.portfolioStrengthBreakdown.achievements.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />} 3+ Achievements
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {analytics.portfolioStrengthBreakdown.evidence.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />} Skill evidence mapped
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {analytics.portfolioStrengthBreakdown.resume.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />} Resume verified
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>{Object.values(analytics.portfolioStrengthBreakdown).filter(v => v.complete).length} / 7 completed</span>
                  </div>
                  <Progress value={(Object.values(analytics.portfolioStrengthBreakdown).filter(v => v.complete).length / 7) * 100} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 10. RECENT ACTIVITY */}
          <motion.div variants={item}>
            <Card className="border-border/50 bg-card/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4"/> Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent">
                  {(analytics.recentActivity || []).map(act => (
                    <div key={act.id} className="relative">
                      <div className={`absolute left-[-1.5rem] mt-1 h-3 w-3 rounded-full bg-${act.type === 'primary' ? 'primary' : act.type === 'secondary' ? 'secondary' : act.type === 'accent' ? 'accent' : act.type === 'emerald' ? 'emerald-500' : act.type === 'amber' ? 'amber-500' : 'primary'} ring-4 ring-card`}></div>
                      <p className="text-sm font-medium">{act.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{act.target} • {formatDistanceToNow(new Date(act.date))} ago</p>
                    </div>
                  ))}
                  {(analytics.recentActivity || []).length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
