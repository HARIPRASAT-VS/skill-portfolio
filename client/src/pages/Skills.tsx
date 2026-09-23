import { useState, useMemo } from 'react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import type { Skill, SkillCategory, SkillLevel } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Search, Plus, ExternalLink, MoreHorizontal, CheckCircle2, AlertTriangle, Trash2, Edit, Award, FolderKanban, Lock, Globe, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { toast } from 'sonner';


const CATEGORIES: SkillCategory[] = ['Programming', 'Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'AI/ML', 'Tools', 'Soft Skills'];
const LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const CHART_COLORS = ['#4f46e5', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

export default function Skills() {
  const navigate = useNavigate();
  const { 
    skills, projects, certifications, achievements, profile,
    addSkill, updateSkill, deleteSkill, toggleSkillVisibility, addEvidence
  } = usePortfolioStore();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');
  const [proficiencyFilter, setProficiencyFilter] = useState<string>('All Levels');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<string>('Recently Added');

  // Modals
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Active states
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [skillFormData, setSkillFormData] = useState<Partial<Skill>>({
    name: '', category: 'Programming', level: 'Intermediate', progress: 50, yearsOfExperience: '1', description: '', isPublic: true
  });
  const [selectedEvidenceProjects, setSelectedEvidenceProjects] = useState<string[]>([]);
  const [selectedEvidenceCerts, setSelectedEvidenceCerts] = useState<string[]>([]);

  // Computed data
  const skillsWithEvidenceInfo = useMemo(() => {
    return skills.map(skill => {
      const linkedProj = projects.filter(p => p.relatedSkillIds.includes(skill.id));
      const linkedCert = certifications.filter(c => c.relatedSkillIds.includes(skill.id));
      const linkedAchv = achievements.filter(a => a.relatedSkillIds.includes(skill.id));
      return {
        ...skill,
        linkedProjects: linkedProj,
        linkedCertifications: linkedCert,
        linkedAchievements: linkedAchv,
        evidenceCount: linkedProj.length + linkedCert.length + linkedAchv.length
      };
    });
  }, [skills, projects, certifications, achievements]);

  const filteredSkills = useMemo(() => {
    return skillsWithEvidenceInfo.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (skill.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All Categories' || skill.category === categoryFilter;
      const matchesLevel = proficiencyFilter === 'All Levels' || skill.level === proficiencyFilter;
      const matchesEvidence = evidenceFilter === 'All' 
        ? true 
        : evidenceFilter === 'Evidence Linked' 
          ? skill.evidenceCount > 0 
          : skill.evidenceCount === 0;

      return matchesSearch && matchesCategory && matchesLevel && matchesEvidence;
    }).sort((a, b) => {
      if (sortOrder === 'Name A–Z') return a.name.localeCompare(b.name);
      if (sortOrder === 'Proficiency') return b.progress - a.progress;
      if (sortOrder === 'Experience') return parseFloat(b.yearsOfExperience) - parseFloat(a.yearsOfExperience);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Recently Added
    });
  }, [skillsWithEvidenceInfo, searchQuery, categoryFilter, proficiencyFilter, evidenceFilter, sortOrder]);

  // Analytics
  const evidenceCoverage = skills.length > 0 ? Math.round((skillsWithEvidenceInfo.filter(s => s.evidenceCount > 0).length / skills.length) * 100) : 0;
  const categoryCounts = skills.reduce((acc, skill) => { acc[skill.category] = (acc[skill.category] || 0) + 1; return acc; }, {} as Record<string, number>);
  const chartData = Object.keys(categoryCounts).map(key => ({ name: key, value: categoryCounts[key] }));

  // Handlers
  const handleOpenAddModal = () => {
    setActiveSkill(null);
    setSkillFormData({ name: '', category: 'Frontend', level: 'Intermediate', progress: 50, yearsOfExperience: '1', description: '', isPublic: true });
    setSelectedEvidenceProjects([]);
    setSelectedEvidenceCerts([]);
    setIsSkillModalOpen(true);
  };

  const handleOpenEditModal = (skill: any) => {
    setActiveSkill(skill);
    setSkillFormData(skill);
    setSelectedEvidenceProjects(skill.linkedProjects.map((p:any) => p.id));
    setSelectedEvidenceCerts(skill.linkedCertifications.map((c:any) => c.id));
    setIsSkillModalOpen(true);
  };

  const handleSaveSkill = () => {
    if (!skillFormData.name) { toast.error("Skill name is required"); return; }
    
    let newSkillId = activeSkill ? activeSkill.id : `skill-${crypto.randomUUID().slice(0,8)}`;
    
    if (activeSkill) {
      updateSkill(activeSkill.id, skillFormData);
      toast.success("Skill updated successfully!");
    } else {
      addSkill({
        ...skillFormData,
        id: newSkillId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Skill);
      toast.success("Skill added successfully!");
    }

    // Sync evidence
    if (selectedEvidenceProjects.length > 0 || selectedEvidenceCerts.length > 0) {
      // First remove all existing evidence for this skill to cleanly apply the new selections
      usePortfolioStore.getState().removeEvidence(newSkillId, {
        projects: projects.map(p => p.id),
        certifications: certifications.map(c => c.id)
      });
      // Add selected
      addEvidence(newSkillId, {
        projects: selectedEvidenceProjects,
        certifications: selectedEvidenceCerts
      });
    }

    setIsSkillModalOpen(false);
  };

  const handleDelete = () => {
    if (activeSkill) {
      deleteSkill(activeSkill.id);
      setIsDeleteModalOpen(false);
      toast.success("Skill deleted successfully.");
    }
  };

  const handleSaveEvidenceOnly = () => {
    if (activeSkill) {
      usePortfolioStore.getState().removeEvidence(activeSkill.id, {
        projects: projects.map(p => p.id),
        certifications: certifications.map(c => c.id)
      });
      addEvidence(activeSkill.id, {
        projects: selectedEvidenceProjects,
        certifications: selectedEvidenceCerts
      });
      setIsEvidenceModalOpen(false);
      toast.success("Evidence linked successfully!");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">My Skills</h1>
          <p className="text-muted-foreground">Showcase the technologies and abilities you've developed.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/portfolio/${(profile.fullName || 'User').split(' ')[0].toLowerCase()}`}>
            <Button variant="outline" className="shadow-sm">View Public Portfolio <ArrowRight className="w-4 h-4 ml-2"/></Button>
          </Link>
          <Button onClick={handleOpenAddModal} className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Skill
          </Button>
        </div>
      </div>

      {/* 2. SKILL SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 shadow-sm border-border/50"><CardContent className="p-4 flex flex-col items-center justify-center text-center h-full"><span className="text-3xl font-bold text-primary">{skills.length}</span><span className="text-sm font-medium text-muted-foreground">Total Skills</span></CardContent></Card>
        <Card className="bg-card/50 shadow-sm border-border/50"><CardContent className="p-4 flex flex-col items-center justify-center text-center h-full"><span className="text-3xl font-bold text-emerald-600">{skillsWithEvidenceInfo.filter(s => s.evidenceCount > 0).length}</span><span className="text-sm font-medium text-muted-foreground">Skills With Evidence</span></CardContent></Card>
        <Card className="bg-card/50 shadow-sm border-border/50"><CardContent className="p-4 flex flex-col items-center justify-center text-center h-full"><span className="text-3xl font-bold text-accent">{skills.filter(s => s.level === 'Advanced' || s.level === 'Expert').length}</span><span className="text-sm font-medium text-muted-foreground">Advanced Skills</span></CardContent></Card>
        <Card className="bg-card/50 shadow-sm border-border/50"><CardContent className="p-4 flex flex-col items-center justify-center text-center h-full"><span className="text-3xl font-bold">{Object.keys(categoryCounts).length}</span><span className="text-sm font-medium text-muted-foreground">Skill Categories</span></CardContent></Card>
      </div>

      {/* 3 & 4. SEARCH AND FILTER BAR */}
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search skills by name, description, or tech..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 bg-background" />
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option>All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm" value={proficiencyFilter} onChange={(e) => setProficiencyFilter(e.target.value)}>
                <option>All Levels</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm" value={evidenceFilter} onChange={(e) => setEvidenceFilter(e.target.value)}>
                <option>All</option>
                <option>Evidence Linked</option>
                <option>Needs Evidence</option>
              </select>
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option>Recently Added</option>
                <option>Name A–Z</option>
                <option>Proficiency</option>
                <option>Experience</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics & Categories Row */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* 5 & 6. SKILL CARDS */}
          {filteredSkills.length === 0 ? (
            <Card className="border-dashed bg-card/30">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-bold mb-2">{skills.length === 0 ? 'No skills added yet' : 'No skills found'}</h3>
                <p className="text-muted-foreground mb-6">
                  {skills.length === 0 ? "Start building your professional skill profile. Add technologies, programming languages and other abilities you've developed." : "Try searching for another skill or changing your filters."}
                </p>
                {skills.length === 0 ? (
                  <Button onClick={handleOpenAddModal}><Plus className="w-4 h-4 mr-2"/> Add Your First Skill</Button>
                ) : (
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setCategoryFilter('All Categories'); setProficiencyFilter('All Levels'); setEvidenceFilter('All'); }}>Clear Filters</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredSkills.map(skill => (
                  <motion.div key={skill.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                    <Card className={`h-full flex flex-col border-border/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${!skill.isPublic ? 'opacity-80' : ''}`}>
                      {!skill.isPublic && (
                        <div className="absolute top-2 right-2 text-muted-foreground flex items-center gap-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded font-medium"><Lock className="w-3 h-3"/> Private</div>
                      )}
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">{skill.category}</div>
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-lg leading-tight hover:text-primary cursor-pointer transition-colors" onClick={() => { setActiveSkill(skill); setIsDetailModalOpen(true); }}>{skill.name}</h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0 -mr-2"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEditModal(skill)}><Edit className="w-4 h-4 mr-2"/> Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setActiveSkill(skill); setSelectedEvidenceProjects(skill.linkedProjects.map((p:any)=>p.id)); setSelectedEvidenceCerts(skill.linkedCertifications.map((c:any)=>c.id)); setIsEvidenceModalOpen(true); }}><FolderKanban className="w-4 h-4 mr-2"/> Manage Evidence</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleSkillVisibility(skill.id)}>{skill.isPublic ? <><Lock className="w-4 h-4 mr-2"/> Make Private</> : <><Globe className="w-4 h-4 mr-2"/> Make Public</>}</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => { setActiveSkill(skill); setIsDeleteModalOpen(true); }}><Trash2 className="w-4 h-4 mr-2"/> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1 text-sm font-medium">
                            <span className={skill.level === 'Expert' ? 'text-accent font-bold' : skill.level === 'Advanced' ? 'text-primary' : 'text-foreground'}>{skill.level}</span>
                            <span>{skill.progress}%</span>
                          </div>
                          <Progress value={skill.progress} className="h-2 mb-1" />
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Self-assessed proficiency</div>
                        </div>

                        <div className="text-sm font-medium text-muted-foreground mb-4 bg-secondary/30 p-2 rounded-md">
                          {skill.yearsOfExperience} {parseFloat(skill.yearsOfExperience) === 1 ? 'year' : 'years'} experience
                        </div>

                        <div className="mt-auto border-t border-border/50 pt-4 flex items-center justify-between">
                          {skill.evidenceCount > 0 ? (
                            <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-500">
                              <CheckCircle2 className="w-4 h-4 mr-1.5" /> {skill.evidenceCount} Evidence Item{skill.evidenceCount !== 1 ? 's' : ''}
                            </div>
                          ) : (
                            <div className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-500">
                              <AlertTriangle className="w-4 h-4 mr-1.5" /> Needs Evidence
                            </div>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 text-xs -mr-2" onClick={() => { setActiveSkill(skill); setIsDetailModalOpen(true); }}>View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right Sidebar Analytics & Recommendations */}
        <div className="space-y-6">
          {/* 18. EVIDENCE COVERAGE */}
          <Card className="border-border/50 shadow-sm bg-gradient-to-br from-card to-secondary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                Evidence Coverage
                <span className="text-2xl font-black text-primary">{evidenceCoverage}%</span>
              </CardTitle>
              <CardDescription>of your skills have supporting evidence</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={evidenceCoverage} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground font-medium mb-4">{skillsWithEvidenceInfo.filter(s => s.evidenceCount > 0).length} of {skills.length} skills backed by evidence</p>
              {evidenceCoverage < 100 && (
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setEvidenceFilter('Needs Evidence')}>Improve Evidence <ArrowRight className="w-3 h-3 ml-1"/></Button>
              )}
            </CardContent>
          </Card>

          {/* 17. SKILL DISTRIBUTION */}
          {skills.length > 0 && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-0"><CardTitle className="text-base">Skill Distribution</CardTitle></CardHeader>
              <CardContent className="h-[250px] relative pt-4 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="45%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                      {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-6">
                  <span className="text-xl font-bold">{skills.length}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">Skills</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 19. RECOMMENDATIONS */}
          <Card className="border-border/50 shadow-sm border-primary/20">
            <CardHeader className="pb-3 bg-primary/5 rounded-t-xl border-b border-primary/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-primary"/> Improve Your Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm">
              <div className="divide-y divide-border/50">
                {skillsWithEvidenceInfo.filter(s => s.evidenceCount === 0).slice(0, 2).map(s => (
                  <div key={s.id} className="p-4 hover:bg-secondary/30">
                    <p className="font-medium text-amber-600 dark:text-amber-500 mb-1">⚠ {s.name} has no evidence linked.</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => { setActiveSkill(s); setSelectedEvidenceProjects([]); setSelectedEvidenceCerts([]); setIsEvidenceModalOpen(true); }}>Add Evidence <ArrowRight className="w-3 h-3 ml-1"/></Button>
                  </div>
                ))}
                {skills.length > projects.length * 2 && (
                  <div className="p-4 hover:bg-secondary/30">
                    <p className="font-medium mb-1">💡 You have {skills.length} skills but only {projects.length} projects.</p>
                    <p className="text-xs text-muted-foreground mb-2">Consider adding more projects to demonstrate your skills.</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => navigate('/dashboard/projects')}>Add Project <ArrowRight className="w-3 h-3 ml-1"/></Button>
                  </div>
                )}
                {skills.length === 0 && (
                  <div className="p-4">
                    <p className="text-muted-foreground text-sm">Add some skills to see recommendations.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 16. CATEGORY SUMMARY */}
      {skills.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4">Skills by Category</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <Badge key={cat} variant="secondary" className="px-3 py-1.5 text-sm font-medium bg-secondary/60">
                {cat} <span className="ml-2 bg-background px-1.5 py-0.5 rounded text-xs">{count as number}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 12 & 13. ADD/EDIT SKILL MODAL */}
      <Dialog open={isSkillModalOpen} onOpenChange={setIsSkillModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
            <DialogDescription>{activeSkill ? 'Update your skill details and evidence.' : 'Add a new technology, language, or ability to your portfolio.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Skill Name</Label>
                <Input value={skillFormData.name} onChange={e => setSkillFormData({...skillFormData, name: e.target.value})} placeholder="e.g. React, Python" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={skillFormData.category} onChange={e => setSkillFormData({...skillFormData, category: e.target.value as SkillCategory})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proficiency Level</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={skillFormData.level} onChange={e => setSkillFormData({...skillFormData, level: e.target.value as SkillLevel})}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input type="number" step="0.5" min="0" value={skillFormData.yearsOfExperience} onChange={e => setSkillFormData({...skillFormData, yearsOfExperience: e.target.value})} placeholder="e.g. 2" />
              </div>
            </div>

            <div className="space-y-3 p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex justify-between">
                <Label>Self-Assessed Proficiency</Label>
                <span className="text-sm font-bold text-primary">{skillFormData.progress}%</span>
              </div>
              <input type="range" min="0" max="100" value={skillFormData.progress} onChange={e => setSkillFormData({...skillFormData, progress: parseInt(e.target.value)})} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">This represents your confidence and capability relative to a senior level.</p>
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea value={skillFormData.description || ''} onChange={e => setSkillFormData({...skillFormData, description: e.target.value})} placeholder="Briefly describe your experience with this skill." className="resize-none" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Public Visibility</Label>
                <Switch checked={skillFormData.isPublic} onCheckedChange={c => setSkillFormData({...skillFormData, isPublic: c})} />
              </div>
              <p className="text-xs text-muted-foreground">If disabled, this skill will not appear on your recruiter-facing public portfolio.</p>
            </div>

            {/* Evidence Checklist in Add Form */}
            <div className="space-y-4 pt-4 border-t border-border">
              <Label className="text-base">Supporting Evidence (Highly Recommended)</Label>
              <p className="text-xs text-muted-foreground -mt-3">Connect projects and certifications to immediately prove this skill.</p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><FolderKanban className="w-4 h-4"/> Projects</h4>
                  {projects.length === 0 ? <p className="text-xs text-muted-foreground">No projects available.</p> : (
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {projects.map(p => (
                        <label key={p.id} className="flex items-start gap-2 text-sm cursor-pointer group">
                          <input type="checkbox" className="mt-1 accent-primary" checked={selectedEvidenceProjects.includes(p.id)} onChange={(e) => {
                            if (e.target.checked) setSelectedEvidenceProjects([...selectedEvidenceProjects, p.id]);
                            else setSelectedEvidenceProjects(selectedEvidenceProjects.filter(id => id !== p.id));
                          }} />
                          <span className="group-hover:text-primary transition-colors leading-tight">{p.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Award className="w-4 h-4"/> Certifications</h4>
                  {certifications.length === 0 ? <p className="text-xs text-muted-foreground">No certifications available.</p> : (
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {certifications.map(c => (
                        <label key={c.id} className="flex items-start gap-2 text-sm cursor-pointer group">
                          <input type="checkbox" className="mt-1 accent-primary" checked={selectedEvidenceCerts.includes(c.id)} onChange={(e) => {
                            if (e.target.checked) setSelectedEvidenceCerts([...selectedEvidenceCerts, c.id]);
                            else setSelectedEvidenceCerts(selectedEvidenceCerts.filter(id => id !== c.id));
                          }} />
                          <span className="group-hover:text-primary transition-colors leading-tight">{c.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSkillModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSkill}>{activeSkill ? 'Save Changes' : 'Add Skill'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 22. SKILL DETAIL VIEW MODAL */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {activeSkill && (() => {
            const extSkill = skillsWithEvidenceInfo.find(s => s.id === activeSkill.id)!;
            if(!extSkill) return null;
            return (
              <>
                <DialogHeader className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="text-2xl mb-1">{extSkill.name}</DialogTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="font-normal">{extSkill.category}</Badge>
                        <Badge variant="outline" className="font-normal">{extSkill.level}</Badge>
                      </div>
                    </div>
                    {extSkill.isPublic ? <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none"><Globe className="w-3 h-3 mr-1"/> Public</Badge> : <Badge variant="secondary" className="border-none"><Lock className="w-3 h-3 mr-1"/> Private</Badge>}
                  </div>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Self-Assessed</div>
                      <div className="text-xl font-bold">{extSkill.progress}%</div>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Experience</div>
                      <div className="text-xl font-bold">{extSkill.yearsOfExperience} yrs</div>
                    </div>
                  </div>

                  {extSkill.description && (
                    <div>
                      <div className="text-sm font-semibold mb-1">Description</div>
                      <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">"{extSkill.description}"</p>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-4">Evidence ({extSkill.evidenceCount})</h4>
                    
                    {extSkill.evidenceCount === 0 ? (
                      <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 rounded-lg border border-amber-200 dark:border-amber-900/50">
                        <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm font-medium mb-2">No evidence linked</p>
                        <Button size="sm" variant="outline" className="h-8 bg-white dark:bg-background" onClick={() => { setIsDetailModalOpen(false); setSelectedEvidenceProjects([]); setSelectedEvidenceCerts([]); setIsEvidenceModalOpen(true); }}>Add Evidence</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {extSkill.linkedProjects.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-semibold flex items-center"><FolderKanban className="w-4 h-4 mr-1.5"/> Projects</div>
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => { setIsDetailModalOpen(false); navigate('/dashboard/projects'); }}>View All <ExternalLink className="w-3 h-3 ml-1"/></Button>
                            </div>
                            <ul className="space-y-2">
                              {extSkill.linkedProjects.map((p:any) => <li key={p.id} className="text-sm pl-5 relative before:absolute before:left-1 before:top-2 before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full">{p.title}</li>)}
                            </ul>
                          </div>
                        )}
                        {extSkill.linkedCertifications.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-semibold flex items-center"><Award className="w-4 h-4 mr-1.5 text-amber-500"/> Certifications</div>
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => { setIsDetailModalOpen(false); navigate('/dashboard/certifications'); }}>View All <ExternalLink className="w-3 h-3 ml-1"/></Button>
                            </div>
                            <ul className="space-y-2">
                              {extSkill.linkedCertifications.map((c:any) => <li key={c.id} className="text-sm pl-5 relative before:absolute before:left-1 before:top-2 before:w-1.5 before:h-1.5 before:bg-amber-500 before:rounded-full">{c.title}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="mt-6 border-t border-border pt-4">
                  <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
                  <Button onClick={() => { setIsDetailModalOpen(false); handleOpenEditModal(activeSkill); }}><Edit className="w-4 h-4 mr-2"/> Edit Skill</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* 15. ADD EVIDENCE MODAL */}
      <Dialog open={isEvidenceModalOpen} onOpenChange={setIsEvidenceModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Evidence for {activeSkill?.name}</DialogTitle>
            <DialogDescription>Select the projects and certifications that demonstrate your proficiency in this skill.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-1 bg-secondary/50 p-2 rounded-md"><FolderKanban className="w-4 h-4"/> Projects</h4>
              {projects.length === 0 ? <p className="text-sm text-muted-foreground px-2">No projects added to your portfolio yet.</p> : (
                <div className="space-y-3 px-2">
                  {projects.map(p => (
                    <label key={p.id} className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-secondary/30 rounded-md transition-colors">
                      <input type="checkbox" className="mt-1 w-4 h-4 accent-primary" checked={selectedEvidenceProjects.includes(p.id)} onChange={(e) => {
                        if (e.target.checked) setSelectedEvidenceProjects([...selectedEvidenceProjects, p.id]);
                        else setSelectedEvidenceProjects(selectedEvidenceProjects.filter(id => id !== p.id));
                      }} />
                      <div>
                        <span className="font-medium group-hover:text-primary transition-colors block leading-tight">{p.title}</span>
                        <span className="text-xs text-muted-foreground">{p.technologies.slice(0,3).join(' • ')}{p.technologies.length > 3 ? '...' : ''}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-1 bg-secondary/50 p-2 rounded-md"><Award className="w-4 h-4"/> Certifications</h4>
              {certifications.length === 0 ? <p className="text-sm text-muted-foreground px-2">No certifications added to your portfolio yet.</p> : (
                <div className="space-y-3 px-2">
                  {certifications.map(c => (
                    <label key={c.id} className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-secondary/30 rounded-md transition-colors">
                      <input type="checkbox" className="mt-1 w-4 h-4 accent-primary" checked={selectedEvidenceCerts.includes(c.id)} onChange={(e) => {
                        if (e.target.checked) setSelectedEvidenceCerts([...selectedEvidenceCerts, c.id]);
                        else setSelectedEvidenceCerts(selectedEvidenceCerts.filter(id => id !== c.id));
                      }} />
                      <div>
                        <span className="font-medium group-hover:text-primary transition-colors block leading-tight">{c.title}</span>
                        <span className="text-xs text-muted-foreground">{c.organization}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEvidenceModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEvidenceOnly}>Save Evidence</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 14. DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Delete Skill?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{activeSkill?.name}</strong> from your portfolio? This will also remove its evidence relationships from your projects and certifications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Skill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
