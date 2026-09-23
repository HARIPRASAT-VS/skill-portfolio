import { useState, useMemo } from 'react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import type { Achievement } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Search, Plus, Trash2, Edit, Globe, Lock, AlertTriangle, ArrowRight, Activity, Calendar, Trophy, Medal, MapPin, Award, Star, Zap, LayoutTemplate } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Achievements() {
  const navigate = useNavigate();
  const { 
    achievements, skills, projects, profile,
    addAchievement, updateAchievement, deleteAchievement, 
  } = usePortfolioStore();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [visibilityFilter, setVisibilityFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');

  // Modals
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Active states
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);
  
  // Form State
  const initialFormState: Partial<Achievement> = {
    title: '', organization: '', description: '', date: '', category: 'Hackathon', 
    relatedSkillIds: [], relatedProjectIds: [], isPublic: true
  };
  const [formData, setFormData] = useState<Partial<Achievement>>(initialFormState);

  // Extract unique years for filter
  const allYears = useMemo(() => {
    const years = new Set<string>();
    achievements.forEach(a => {
      if(a.date) {
        const yearMatch = a.date.match(/\d{4}/);
        if(yearMatch) years.add(yearMatch[0]);
      }
    });
    return Array.from(years).sort().reverse();
  }, [achievements]);

  // Filtering Logic
  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      const matchesSearch = 
        achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        achievement.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || achievement.category === categoryFilter;
      const matchesVisibility = visibilityFilter === 'All' ? true : visibilityFilter === 'Public' ? achievement.isPublic : !achievement.isPublic;
      
      let matchesYear = true;
      if (yearFilter !== 'All') {
        const yearMatch = achievement.date.match(/\d{4}/);
        matchesYear = yearMatch ? yearMatch[0] === yearFilter : false;
      }

      return matchesSearch && matchesCategory && matchesVisibility && matchesYear;
    }).sort((a, b) => {
      if (sortOrder === 'Name A-Z') return a.title.localeCompare(b.title);
      if (sortOrder === 'Name Z-A') return b.title.localeCompare(a.title);
      if (sortOrder === 'Oldest') return new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime();
      // Newest
      return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime();
    });
  }, [achievements, searchQuery, categoryFilter, visibilityFilter, yearFilter, sortOrder]);

  // Analytics
  const publicCount = achievements.filter(a => a.isPublic).length;
  const skillBackedCount = achievements.filter(a => a.relatedSkillIds.length > 0).length;
  const projectBackedCount = achievements.filter(a => (a.relatedProjectIds?.length ?? 0) > 0).length;
  
  // Recommendations
  const needsSkills = achievements.length - skillBackedCount;
  const needsProjects = achievements.length - projectBackedCount;

  // Handlers
  const handleOpenAddModal = () => {
    setActiveAchievement(null);
    setFormData(initialFormState);
    setIsAchievementModalOpen(true);
  };

  const handleOpenEditModal = (achievement: Achievement, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAchievement(achievement);
    setFormData(achievement);
    setIsAchievementModalOpen(true);
  };

  const handleSaveAchievement = () => {
    if (!formData.title || !formData.organization || !formData.date || !formData.description) {
      toast.error("Title, Organization, Date, and Description are required");
      return;
    }

    if (activeAchievement) {
      updateAchievement(activeAchievement.id, formData);
      toast.success("Achievement updated successfully!");
    } else {
      addAchievement({
        ...formData,
        id: `ach-${crypto.randomUUID().slice(0,8)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Achievement);
      toast.success("Achievement added successfully!");
    }

    setIsAchievementModalOpen(false);
  };

  const handleDelete = () => {
    if (activeAchievement) {
      deleteAchievement(activeAchievement.id);
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
      toast.success("Achievement deleted successfully.");
    }
  };

  // Helper function to map category to icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hackathon': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Competition': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'Leadership': return <Star className="w-5 h-5 text-purple-500" />;
      case 'Academic': return <Award className="w-5 h-5 text-blue-500" />;
      case 'Technical': return <Activity className="w-5 h-5 text-emerald-500" />;
      default: return <Medal className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Achievements</h1>
          <p className="text-muted-foreground">Highlight competitions, milestones, leadership activities and accomplishments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/portfolio/${profile.fullName.split(' ')[0].toLowerCase()}`}>
            <Button variant="outline" className="shadow-sm">View Public Portfolio <ArrowRight className="w-4 h-4 ml-2"/></Button>
          </Link>
          <Button onClick={handleOpenAddModal} className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Achievement
          </Button>
        </div>
      </div>

      {/* 2. SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 shadow-sm border-border/50"><CardContent className="p-4 flex flex-col items-center justify-center text-center h-full"><span className="text-3xl font-bold text-primary">{achievements.length}</span><span className="text-sm font-medium text-muted-foreground">Total Achievements</span></CardContent></Card>
        <Card className="bg-card/50 shadow-sm border-border/50"><CardContent className="p-4 flex flex-col items-center justify-center text-center h-full"><span className="text-3xl font-bold text-emerald-500">{publicCount}</span><span className="text-sm font-medium text-muted-foreground">Public</span></CardContent></Card>
        <Card className="bg-card/50 shadow-sm border-border/50"><CardContent className="p-4 flex flex-col items-center justify-center text-center h-full"><span className="text-3xl font-bold text-blue-500">{skillBackedCount}</span><span className="text-sm font-medium text-muted-foreground">Skill-Related</span></CardContent></Card>
        <Card className="bg-card/50 shadow-sm border-border/50"><CardContent className="p-4 flex flex-col items-center justify-center text-center h-full"><span className="text-3xl font-bold text-amber-500">{Math.min(3, achievements.length)}</span><span className="text-sm font-medium text-muted-foreground">Recent</span></CardContent></Card>
      </div>

      {/* 3 & 4. SEARCH AND FILTERS */}
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search achievements..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 bg-background" />
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Competition">Competition</option>
                <option value="Leadership">Leadership</option>
                <option value="Technical">Technical</option>
                <option value="Academic">Academic</option>
                <option value="Community">Community</option>
                <option value="Other">Other</option>
              </select>
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                <option value="All">All Years</option>
                {allYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm" value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)}>
                <option value="All">All Visibility</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option>Newest</option>
                <option>Oldest</option>
                <option>Name A-Z</option>
                <option>Name Z-A</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. ACHIEVEMENT GRID */}
      {filteredAchievements.length === 0 ? (
        <Card className="border-dashed bg-card/30">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-bold mb-2">{achievements.length === 0 ? 'No achievements yet' : 'No achievements found'}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {achievements.length === 0 
                ? "Highlight hackathons, competitions, leadership activities and milestones." 
                : "Try another search term or clear your filters."}
            </p>
            {achievements.length === 0 ? (
              <Button onClick={handleOpenAddModal}><Plus className="w-4 h-4 mr-2"/> Add Your First Achievement</Button>
            ) : (
              <Button variant="outline" onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setVisibilityFilter('All'); setYearFilter('All'); }}>Clear Filters</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAchievements.map(achievement => (
              <motion.div key={achievement.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`flex flex-col h-full border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group ${!achievement.isPublic ? 'opacity-80' : ''}`}
                  onClick={() => { setActiveAchievement(achievement); setIsDetailModalOpen(true); }}
                >
                  <CardContent className="p-5 flex-1 flex flex-col relative">
                    <div className="absolute top-4 right-4">
                       {achievement.isPublic ? (
                          <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded">
                            <Globe className="w-3 h-3 mr-1"/> Public
                          </div>
                        ) : (
                          <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded">
                            <Lock className="w-3 h-3 mr-1"/> Private
                          </div>
                        )}
                    </div>
                    
                    <div className="flex items-start gap-3 mb-4 pr-16">
                      <div className="p-2 bg-secondary rounded-lg shrink-0">
                        {getCategoryIcon(achievement.category)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{achievement.title}</h4>
                        <div className="text-sm font-medium text-muted-foreground mt-1">{achievement.organization}</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-foreground/80 line-clamp-3 mb-4">{achievement.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Calendar className="w-3.5 h-3.5"/> <span>{achievement.date}</span>
                      <span className="mx-1">•</span>
                      <span>{achievement.category}</span>
                    </div>

                    <div className="mt-auto mb-4">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {achievement.relatedSkillIds.length === 0 ? (
                           <span className="text-xs italic text-muted-foreground">No skills linked</span>
                        ) : (
                          <>
                            {achievement.relatedSkillIds.slice(0,3).map(skillId => {
                              const skill = skills.find(s => s.id === skillId);
                              if (!skill) return null;
                              return <Badge key={skill.id} variant="secondary" className="text-xs px-2 py-0 h-5 font-medium">{skill.name}</Badge>;
                            })}
                            {achievement.relatedSkillIds.length > 3 && (
                              <Badge variant="secondary" className="text-xs px-2 py-0 h-5 font-medium">+{achievement.relatedSkillIds.length - 3}</Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-border/50 pt-3 mt-auto flex items-center justify-end">
                      <div className="flex">
                        <Button 
                          variant="ghost" size="sm" className="h-8 px-3 text-muted-foreground hover:text-primary mr-2"
                          onClick={(e) => { e.stopPropagation(); setActiveAchievement(achievement); setIsDetailModalOpen(true); }}
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={(e) => handleOpenEditModal(achievement, e)}
                          aria-label="Edit achievement" title="Edit achievement"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); setActiveAchievement(achievement); setIsDeleteModalOpen(true); }}
                          aria-label="Delete achievement" title="Delete achievement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 15 & 16 & 18. ANALYTICS, RECOMMENDATIONS, RECENT ACTIVITY */}
      <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-border/50">
        
        {/* Recommendations */}
        <Card className="bg-secondary/30 border-border/50 shadow-sm md:col-span-1">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">💡 Recommendations</h3>
            <div className="space-y-4">
              {needsSkills > 0 ? (
                <div className="text-sm">
                  <span className="font-semibold block mb-1">Add skills to your achievements</span>
                  <span className="text-muted-foreground">{needsSkills} achievement{needsSkills > 1 ? 's are' : ' is'} not linked to any skills. Link them to strengthen your skill evidence.</span>
                </div>
              ) : (
                <div className="text-sm">
                  <span className="font-semibold block mb-1 text-emerald-500">Excellent Skill Coverage!</span>
                  <span className="text-muted-foreground">All your achievements are actively demonstrating your skills.</span>
                </div>
              )}
              <div className="h-px bg-border w-full" />
              {needsProjects > 0 ? (
                <div className="text-sm">
                  <span className="font-semibold block mb-1">Connect to projects</span>
                  <span className="text-muted-foreground">Linking achievements to projects provides stronger context for recruiters.</span>
                </div>
              ) : (
                <div className="text-sm">
                   <span className="font-semibold block mb-1">Great Project Linking!</span>
                   <span className="text-muted-foreground">Your achievements are well-contextualized with real projects.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Summary */}
        <Card className="bg-transparent border-none shadow-none md:col-span-1">
          <CardContent className="p-0">
            <h3 className="font-bold text-lg mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-primary"/> Achievement Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold">{achievements.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Public</span>
                <span className="font-bold text-emerald-500">{publicCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Skill-backed</span>
                <span className="font-bold text-blue-500">{skillBackedCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Project-backed</span>
                <span className="font-bold text-purple-500">{projectBackedCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-transparent border-none shadow-none md:col-span-1">
          <CardContent className="p-0">
            <h3 className="font-bold text-lg mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-primary"/> Recent Activity</h3>
            <div className="space-y-4">
              {achievements.slice(0,3).map((a, i) => (
                <div key={a.id} className="flex gap-3 items-start relative before:absolute before:left-2 before:top-6 before:bottom-[-16px] before:w-[2px] before:bg-border last:before:hidden">
                  <div className={`w-4 h-4 rounded-full mt-1 z-10 flex-shrink-0 ${i === 0 ? 'bg-primary shadow-[0_0_0_4px_var(--primary-20)]' : 'bg-muted-foreground'}`} />
                  <div>
                    <p className="font-medium text-sm">Added {a.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1"><Calendar className="w-3 h-3 mr-1"/> {new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* --- MODALS --- */}

      {/* 8. ADD/EDIT ACHIEVEMENT MODAL */}
      <Dialog open={isAchievementModalOpen} onOpenChange={setIsAchievementModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeAchievement ? 'Edit Achievement' : 'Add New Achievement'}</DialogTitle>
            <DialogDescription>Highlight your milestones and connect them to your skills and projects.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            
            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Title *</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Hackathon Finalist" />
              </div>
              <div className="space-y-2">
                <Label>Organization *</Label>
                <Input value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} placeholder="e.g. IEEE" />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} placeholder="e.g. September 2026" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {['Hackathon', 'Competition', 'Leadership', 'Technical', 'Academic', 'Community', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description *</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe your accomplishment..." className="h-20 resize-none" />
              </div>
            </div>

            {/* SKILLS BINDING */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div>
                <Label className="text-base">Select Skills</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-3">Connecting skills here will make this achievement appear as Evidence on your My Skills page.</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 bg-secondary/30 rounded-md border border-border/50">
                {skills.length === 0 ? <p className="text-xs text-muted-foreground col-span-full">No skills added yet.</p> : (
                  skills.map(skill => (
                    <label key={skill.id} className="flex items-start gap-2 text-sm cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="mt-1 accent-primary" 
                        checked={formData.relatedSkillIds?.includes(skill.id)} 
                        onChange={(e) => {
                          const currentIds = formData.relatedSkillIds || [];
                          if (e.target.checked) setFormData({...formData, relatedSkillIds: [...currentIds, skill.id]});
                          else setFormData({...formData, relatedSkillIds: currentIds.filter(id => id !== skill.id)});
                        }} 
                      />
                      <span className="group-hover:text-primary transition-colors leading-tight">{skill.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* PROJECT BINDING */}
            <div className="space-y-3 pt-4 border-t border-border">
               <div>
                <Label className="text-base">Related Projects</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-3">Link this achievement to the project it was built for.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-secondary/30 rounded-md border border-border/50">
                {projects.length === 0 ? <p className="text-xs text-muted-foreground col-span-full">No projects added yet.</p> : (
                  projects.map(project => (
                    <label key={project.id} className="flex items-start gap-2 text-sm cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="mt-1 accent-primary" 
                        checked={formData.relatedProjectIds?.includes(project.id)} 
                        onChange={(e) => {
                          const currentIds = formData.relatedProjectIds || [];
                          if (e.target.checked) setFormData({...formData, relatedProjectIds: [...currentIds, project.id]});
                          else setFormData({...formData, relatedProjectIds: currentIds.filter(id => id !== project.id)});
                        }} 
                      />
                      <span className="group-hover:text-primary transition-colors leading-tight">{project.title}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-border">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center"><Globe className="w-4 h-4 text-emerald-500 mr-2"/> Show on Public Portfolio</Label>
                  <Switch checked={formData.isPublic} onCheckedChange={c => setFormData({...formData, isPublic: c})} />
                </div>
                <p className="text-xs text-muted-foreground">Make visible to recruiters on your public portfolio page.</p>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAchievementModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAchievement}>{activeAchievement ? 'Save Changes' : 'Add Achievement'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 11. ACHIEVEMENT DETAILS MODAL */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {activeAchievement && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-secondary rounded-xl inline-block shadow-inner">
                    {getCategoryIcon(activeAchievement.category)}
                  </div>
                  {activeAchievement.isPublic ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"><Globe className="w-3 h-3 mr-1"/> Public</Badge>
                  ) : (
                    <Badge variant="secondary"><Lock className="w-3 h-3 mr-1"/> Private</Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl">{activeAchievement.title}</DialogTitle>
                <div className="text-muted-foreground font-medium flex items-center gap-2 mt-2">
                  <MapPin className="w-4 h-4" /> {activeAchievement.organization}
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                  <div>
                    <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Date</div>
                    <div className="font-medium">{activeAchievement.date}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Category</div>
                    <div className="font-medium">{activeAchievement.category}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase text-muted-foreground mb-2">Description</div>
                  <p className="text-sm leading-relaxed">{activeAchievement.description}</p>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase text-muted-foreground mb-3">Skills Demonstrated</div>
                  <div className="flex flex-wrap gap-2">
                    {activeAchievement.relatedSkillIds.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No skills linked to this achievement.</p>
                    ) : (
                      activeAchievement.relatedSkillIds.map(skillId => {
                        const s = skills.find(s => s.id === skillId);
                        if(!s) return null;
                        return (
                          <Badge key={s.id} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => { setIsDetailModalOpen(false); navigate('/dashboard/skills'); }}>
                            {s.name}
                          </Badge>
                        );
                      })
                    )}
                  </div>
                </div>
                
                {activeAchievement.relatedProjectIds && activeAchievement.relatedProjectIds.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase text-muted-foreground mb-3">Related Projects</div>
                    <div className="flex flex-col gap-2">
                      {activeAchievement.relatedProjectIds.map(projectId => {
                        const p = projects.find(p => p.id === projectId);
                        if(!p) return null;
                        return (
                          <div key={p.id} className="flex items-center text-sm p-2 bg-secondary/50 rounded border border-border/50 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setIsDetailModalOpen(false); navigate('/dashboard/projects'); }}>
                            <LayoutTemplate className="w-4 h-4 text-primary mr-2" />
                            <span className="font-medium">{p.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <div className="flex w-full justify-end gap-2">
                   <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { setIsDetailModalOpen(false); setActiveAchievement(activeAchievement); setIsDeleteModalOpen(true); }}><Trash2 className="w-4 h-4 mr-2"/> Delete</Button>
                   <Button onClick={(e) => { setIsDetailModalOpen(false); handleOpenEditModal(activeAchievement, e); }}><Edit className="w-4 h-4 mr-2"/> Edit Achievement</Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 10. DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Delete Achievement?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{activeAchievement?.title}</strong>? This action cannot be undone, and it will be removed from all your skills' evidence lists.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Achievement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
