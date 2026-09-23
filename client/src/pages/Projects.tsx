import { useState, useMemo } from 'react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import type { Project } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Search, Plus, Trash2, Edit, GitBranch, Globe, Star, Play, Lock, AlertTriangle, ArrowRight, Activity, Calendar, LayoutTemplate } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Reusable Project Image with Fallback
function ProjectImage({ src, title }: { src: string, title: string }) {
  const [error, setError] = useState(false);
  
  if (error || !src) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary flex flex-col items-center justify-center text-center p-4">
        <LayoutTemplate className="w-10 h-10 text-primary/40 mb-2" />
        <span className="font-bold text-primary/80 truncate w-full">{title}</span>
        <span className="text-xs text-muted-foreground mt-1">Project</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={title} 
      className="w-full h-48 object-cover transition-transform hover:scale-105"
      onError={() => setError(true)}
    />
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const { 
    projects, skills, profile,
    addProject, updateProject, deleteProject 
  } = usePortfolioStore();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [featuredFilter, setFeaturedFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [techFilter, setTechFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Recently Added');

  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Active states
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  
  // Form State
  const initialFormState: Partial<Project> = {
    title: '', description: '', category: 'Web', status: 'Completed', role: '', duration: '', teamSize: '1', 
    image: '', githubUrl: '', liveUrl: '', technologies: [], relatedSkillIds: [], featured: false, isPublic: true
  };
  const [formData, setFormData] = useState<Partial<Project>>(initialFormState);
  const [techInput, setTechInput] = useState('');

  // Extract all unique technologies across projects for filter
  const allTechnologies = useMemo(() => {
    const techs = new Set<string>();
    projects.forEach(p => p.technologies.forEach(t => techs.add(t)));
    return Array.from(techs).sort();
  }, [projects]);

  // Filtering Logic
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.technologies || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'All' || project.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
      const matchesFeatured = featuredFilter === 'All' ? true : featuredFilter === 'Featured' ? project.featured : !project.featured;
      const matchesTech = techFilter === 'All' || (project.technologies || []).includes(techFilter);

      return matchesSearch && matchesCategory && matchesStatus && matchesFeatured && matchesTech;
    }).sort((a, b) => {
      if (sortOrder === 'Name A-Z') return a.title.localeCompare(b.title);
      if (sortOrder === 'Name Z-A') return b.title.localeCompare(a.title);
      if (sortOrder === 'Featured First') return (a.featured === b.featured) ? 0 : a.featured ? -1 : 1;
      // Recently Added
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [projects, searchQuery, categoryFilter, statusFilter, featuredFilter, techFilter, sortOrder]);

  // Analytics
  const featuredCount = projects.filter(p => p.featured).length;
  const liveDemoCount = projects.filter(p => p.liveUrl).length;
  const githubCount = projects.filter(p => p.githubUrl).length;

  // Handlers
  const handleOpenAddModal = () => {
    setActiveProject(null);
    setFormData(initialFormState);
    setTechInput('');
    setIsProjectModalOpen(true);
  };

  const handleOpenEditModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProject(project);
    setFormData(project);
    setTechInput('');
    setIsProjectModalOpen(true);
  };

  const handleAddTech = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || !techInput.trim()) return;
    e.preventDefault();
    if (!(formData.technologies || []).includes(techInput.trim())) {
      setFormData({ ...formData, technologies: [...(formData.technologies || []), techInput.trim()] });
    }
    setTechInput('');
  };

  const handleRemoveTech = (tech: string) => {
    setFormData({ ...formData, technologies: formData.technologies?.filter(t => t !== tech) });
  };

  const handleSaveProject = () => {
    if (!formData.title || !formData.description) {
      toast.error("Project Title and Description are required");
      return;
    }

    if (formData.featured && !activeProject?.featured && featuredCount >= 3) {
      toast.error("You can feature up to 3 projects. Unfeature another project first.");
      return;
    }

    let urlValidationFailed = false;
    if (formData.githubUrl && !formData.githubUrl.startsWith('http')) urlValidationFailed = true;
    if (formData.liveUrl && !formData.liveUrl.startsWith('http')) urlValidationFailed = true;
    
    if (urlValidationFailed) {
      toast.error("URLs must start with http:// or https://");
      return;
    }

    if (activeProject) {
      updateProject(activeProject.id, formData);
      toast.success("Project updated successfully!");
    } else {
      addProject({
        ...formData,
        id: `proj-${crypto.randomUUID().slice(0,8)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Project);
      toast.success("Project added successfully!");
    }

    setIsProjectModalOpen(false);
  };

  const handleDelete = () => {
    if (activeProject) {
      deleteProject(activeProject.id);
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
      toast.success("Project deleted successfully.");
    }
  };

  const handleOpenUrl = (url: string, type: 'GitHub' | 'Demo', e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success(`${type} link opened.`);
    } else {
      toast.error(`${type === 'GitHub' ? 'GitHub repository' : 'Live demo'} link has not been added for this project.`);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">My Projects</h1>
          <p className="text-muted-foreground">Show the work that demonstrates what you can build.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/portfolio/${(profile.fullName || 'User').split(' ')[0].toLowerCase()}`}>
            <Button variant="outline" className="shadow-sm">View Public Portfolio <ArrowRight className="w-4 h-4 ml-2"/></Button>
          </Link>
          <Button onClick={handleOpenAddModal} className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </div>
      </div>

      {/* 2. SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 shadow-sm border-border/50"><CardContent className="p-4 flex flex-col items-center justify-center text-center h-full"><span className="text-3xl font-bold text-primary">{projects.length}</span><span className="text-sm font-medium text-muted-foreground">Total Projects</span></CardContent></Card>
        <Card className="bg-card/50 shadow-sm border-border/50"><CardContent className="p-4 flex flex-col items-center justify-center text-center h-full"><span className="text-3xl font-bold text-amber-500">{featuredCount}</span><span className="text-sm font-medium text-muted-foreground">Featured</span></CardContent></Card>
        <Card className="bg-card/50 shadow-sm border-border/50"><CardContent className="p-4 flex flex-col items-center justify-center text-center h-full"><span className="text-3xl font-bold text-emerald-600">{liveDemoCount}</span><span className="text-sm font-medium text-muted-foreground">With Live Demo</span></CardContent></Card>
        <Card className="bg-card/50 shadow-sm border-border/50"><CardContent className="p-4 flex flex-col items-center justify-center text-center h-full"><span className="text-3xl font-bold">{githubCount}</span><span className="text-sm font-medium text-muted-foreground">With GitHub</span></CardContent></Card>
      </div>

      {/* 3 & 4. SEARCH AND FILTERS */}
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search projects by name, description, or technology..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 bg-background" />
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Web">Web</option>
                <option value="Mobile">Mobile</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Backend">Backend</option>
                <option value="IoT">IoT</option>
                <option value="Desktop">Desktop</option>
                <option value="Other">Other</option>
              </select>
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm max-w-[150px]" value={techFilter} onChange={(e) => setTechFilter(e.target.value)}>
                <option value="All">All Tech</option>
                {allTechnologies.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm" value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)}>
                <option value="All">All Projects</option>
                <option value="Featured">Featured</option>
                <option value="Not Featured">Not Featured</option>
              </select>
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Archived">Archived</option>
              </select>
              <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option>Recently Added</option>
                <option>Name A-Z</option>
                <option>Name Z-A</option>
                <option>Featured First</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. PROJECT GRID */}
      {filteredProjects.length === 0 ? (
        <Card className="border-dashed bg-card/30">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <LayoutTemplate className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-bold mb-2">{projects.length === 0 ? 'No projects yet' : 'No projects found'}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {projects.length === 0 
                ? "Start showcasing the work you've built. Add projects to demonstrate your skills and strengthen your portfolio." 
                : "Try another search term or clear your filters."}
            </p>
            {projects.length === 0 ? (
              <Button onClick={handleOpenAddModal}><Plus className="w-4 h-4 mr-2"/> Add Your First Project</Button>
            ) : (
              <Button variant="outline" onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setStatusFilter('All'); setFeaturedFilter('All'); setTechFilter('All'); }}>Clear Filters</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map(project => (
              <motion.div key={project.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`flex flex-col h-full border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group ${!project.isPublic ? 'opacity-80' : ''}`}
                  onClick={() => { setActiveProject(project); setIsDetailModalOpen(true); }}
                >
                  {/* Image Section */}
                  <div className="relative overflow-hidden border-b border-border/50">
                    <ProjectImage src={project.image} title={project.title} />
                    
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                      {project.featured && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 border-none shadow-sm"><Star className="w-3 h-3 mr-1 fill-white"/> Featured</Badge>
                      )}
                      {!project.isPublic && (
                        <Badge variant="secondary" className="shadow-sm"><Lock className="w-3 h-3 mr-1"/> Private</Badge>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{project.category}</div>
                      <div className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' : project.status === 'In Progress' ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-500/10 text-gray-600'}`}>
                        {project.status || 'Completed'}
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-xl leading-tight mb-2 group-hover:text-primary transition-colors">{project.title}</h4>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.description}</p>
                    
                    <div className="mt-auto mb-4">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">Technologies</div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0,4).map(tech => (
                          <Badge key={tech} variant="secondary" className="text-xs px-2 py-0 h-5 font-medium">{tech}</Badge>
                        ))}
                        {(project.technologies || []).length > 4 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0 h-5 font-medium">+{(project.technologies || []).length - 4}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-border/50 pt-3 mt-auto flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" size="sm" className="h-8 px-2 text-xs" 
                          onClick={(e) => handleOpenUrl(project.githubUrl, 'GitHub', e)}
                          aria-label="Open GitHub repository"
                        >
                          <GitBranch className="w-4 h-4 mr-1.5" /> Code
                        </Button>
                        <Button 
                          variant="ghost" size="sm" className="h-8 px-2 text-xs"
                          onClick={(e) => handleOpenUrl(project.liveUrl, 'Demo', e)}
                          aria-label="Open live demo"
                        >
                          <Play className="w-4 h-4 mr-1.5" /> Demo
                        </Button>
                      </div>
                      <div className="flex">
                        <Button 
                          variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={(e) => handleOpenEditModal(project, e)}
                          aria-label="Edit project" title="Edit project"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); setActiveProject(project); setIsDeleteModalOpen(true); }}
                          aria-label="Delete project" title="Delete project"
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

      {/* 27. RECENT PROJECT ACTIVITY & ANALYTICS */}
      <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-0">
            <h3 className="font-bold text-lg mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-primary"/> Recent Project Activity</h3>
            <div className="space-y-4">
              {projects.slice(0,3).map((p, i) => (
                <div key={p.id} className="flex gap-3 items-start relative before:absolute before:left-2 before:top-6 before:bottom-[-16px] before:w-[2px] before:bg-border last:before:hidden">
                  <div className={`w-4 h-4 rounded-full mt-1 z-10 flex-shrink-0 ${i === 0 ? 'bg-primary shadow-[0_0_0_4px_var(--primary-20)]' : 'bg-muted-foreground'}`} />
                  <div>
                    <p className="font-medium text-sm">Updated {p.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1"><Calendar className="w-3 h-3 mr-1"/> {new Date(p.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/30 border-border/50 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center"><LayoutTemplate className="w-5 h-5 mr-2 text-primary"/> Project Portfolio</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div><div className="text-2xl font-bold">{projects.length}</div><div className="text-xs font-medium text-muted-foreground uppercase">Total Projects</div></div>
              <div><div className="text-2xl font-bold">{projects.filter(p=>p.status==='Completed').length}</div><div className="text-xs font-medium text-muted-foreground uppercase">Completed</div></div>
              <div><div className="text-2xl font-bold text-amber-500">{featuredCount}</div><div className="text-xs font-medium text-muted-foreground uppercase">Featured</div></div>
              <div><div className="text-2xl font-bold text-emerald-500">{projects.filter(p=>p.isPublic).length}</div><div className="text-xs font-medium text-muted-foreground uppercase">Public</div></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- MODALS --- */}

      {/* 13. ADD/EDIT PROJECT MODAL */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>{activeProject ? 'Update your project details and connections.' : 'Showcase your work and connect it to your skills.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            
            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Project Name *</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. GROUPS.BIT" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description *</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe what the project does..." className="h-24 resize-none" />
              </div>
            </div>

            {/* Meta Info */}
            <div className="grid sm:grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-lg border border-border/50">
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {['Web', 'Mobile', 'AI/ML', 'Backend', 'IoT', 'Desktop', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Full Stack Developer" />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. Jan 2026 - Jun 2026" />
              </div>
              <div className="space-y-2">
                <Label>Team Size</Label>
                <Input type="number" min="1" value={formData.teamSize} onChange={e => setFormData({...formData, teamSize: e.target.value})} placeholder="1" />
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-3">
              <Label>Technologies Used</Label>
              <div className="flex gap-2">
                <Input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={handleAddTech} placeholder="e.g. React (Press Enter to add)" />
                <Button variant="secondary" onClick={handleAddTech}>Add</Button>
              </div>
              {formData.technologies && formData.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-secondary/20 rounded-md border border-border/30">
                  {formData.technologies.map(tech => (
                    <Badge key={tech} className="bg-primary/10 text-primary hover:bg-destructive/20 hover:text-destructive cursor-pointer border-none flex items-center gap-1" onClick={() => handleRemoveTech(tech)}>
                      {tech} <span className="text-[10px] font-bold">×</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* URLs & Image */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Project Image URL</Label>
                <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GitHub URL</Label>
                  <Input value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} placeholder="https://github.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Live Demo URL</Label>
                  <Input value={formData.liveUrl} onChange={e => setFormData({...formData, liveUrl: e.target.value})} placeholder="https://..." />
                </div>
              </div>
            </div>

            {/* SKILLS BINDING */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div>
                <Label className="text-base">Skills Demonstrated</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-3">Connecting skills here will make this project appear as Evidence on your My Skills page.</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 bg-secondary/30 rounded-md border border-border/50">
                {skills.length === 0 ? <p className="text-xs text-muted-foreground col-span-full">No skills added yet. Go to My Skills to add some.</p> : (
                  skills.map(skill => (
                    <label key={skill.id} className="flex items-start gap-2 text-sm cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="mt-1 accent-primary" 
                        checked={(formData.relatedSkillIds || []).includes(skill.id)} 
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

            {/* Toggles */}
            <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center"><Star className="w-4 h-4 text-amber-500 mr-2"/> Featured Project</Label>
                  <Switch checked={formData.featured} onCheckedChange={c => setFormData({...formData, featured: c})} />
                </div>
                <p className="text-xs text-muted-foreground">Highlight this project on your dashboard.</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center"><Globe className="w-4 h-4 text-emerald-500 mr-2"/> Show on Public Portfolio</Label>
                  <Switch checked={formData.isPublic} onCheckedChange={c => setFormData({...formData, isPublic: c})} />
                </div>
                <p className="text-xs text-muted-foreground">Make visible to recruiters.</p>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProjectModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProject}>{activeProject ? 'Save Changes' : 'Add Project'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 24. PROJECT DETAILS MODAL */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background">
          {activeProject && (
            <>
              {/* Header Image */}
              <div className="relative h-48 sm:h-64 border-b border-border">
                <ProjectImage src={activeProject.image} title={activeProject.title} />
                <div className="absolute top-4 right-4 flex gap-2">
                  {activeProject.featured && <Badge className="bg-amber-500 border-none"><Star className="w-3 h-3 mr-1 fill-white"/> Featured</Badge>}
                  {activeProject.status === 'Completed' ? <Badge className="bg-emerald-500 border-none">Completed</Badge> : <Badge className="bg-blue-500 border-none">{activeProject.status}</Badge>}
                  {activeProject.isPublic ? <Badge className="bg-emerald-600/20 text-emerald-100 backdrop-blur-sm border-emerald-500/30">Public</Badge> : <Badge variant="secondary" className="backdrop-blur-sm bg-black/50 text-white border-white/20"><Lock className="w-3 h-3 mr-1"/> Private</Badge>}
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-3">{activeProject.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{activeProject.description}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-border/50">
                  <div><div className="text-xs font-bold uppercase text-muted-foreground mb-1">Category</div><div className="font-medium">{activeProject.category}</div></div>
                  <div><div className="text-xs font-bold uppercase text-muted-foreground mb-1">Role</div><div className="font-medium">{activeProject.role || '-'}</div></div>
                  <div><div className="text-xs font-bold uppercase text-muted-foreground mb-1">Duration</div><div className="font-medium">{activeProject.duration || '-'}</div></div>
                  <div><div className="text-xs font-bold uppercase text-muted-foreground mb-1">Team</div><div className="font-medium">{activeProject.teamSize} member{activeProject.teamSize !== '1' ? 's' : ''}</div></div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeProject.technologies.map(tech => <Badge key={tech} variant="secondary" className="font-medium bg-secondary/50">{tech}</Badge>)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">Skills Demonstrated</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeProject.relatedSkillIds.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No skills linked to this project.</p>
                      ) : (
                        activeProject.relatedSkillIds.map(skillId => {
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
                </div>

                <DialogFooter className="mt-6 pt-4">
                  <div className="flex w-full justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={(e) => handleOpenUrl(activeProject.githubUrl, 'GitHub', e)}><GitBranch className="w-4 h-4 mr-2" /> View Code</Button>
                      <Button onClick={(e) => handleOpenUrl(activeProject.liveUrl, 'Demo', e)}><Play className="w-4 h-4 mr-2" /> View Demo</Button>
                    </div>
                    <Button variant="ghost" onClick={(e) => { setIsDetailModalOpen(false); handleOpenEditModal(activeProject, e); }}><Edit className="w-4 h-4 mr-2"/> Edit</Button>
                  </div>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 16. DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Delete Project?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{activeProject?.title}</strong>? This action cannot be undone, and it will be removed from all your skills' evidence lists.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
