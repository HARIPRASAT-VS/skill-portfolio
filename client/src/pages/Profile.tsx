import { useState } from 'react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { motion } from 'framer-motion';
import { Edit, ExternalLink, GitBranch, UserCircle, Mail, FileText, MapPin, GraduationCap, Building, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { profile, skills, projects, certifications, achievements, updateProfile } = usePortfolioStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(profile);

  // Strength calculation matching dashboard
  let strength = 0;
  if (profile.fullName) strength += 15;
  if (skills.length > 0) strength += Math.min(20, skills.length * 4);
  if (projects.length > 0) strength += Math.min(25, projects.length * 5);
  if (certifications.length > 0) strength += Math.min(15, certifications.length * 5);
  if (achievements.length > 0) strength += Math.min(10, achievements.length * 5);
  
  const evidenceScore = skills.filter(s => 
    projects.some(p => p.relatedSkillIds.includes(s.id)) ||
    certifications.some(c => c.relatedSkillIds.includes(s.id)) ||
    achievements.some(a => a.relatedSkillIds.includes(s.id))
  ).length * 5;
  
  strength += Math.min(15, evidenceScore);

  const handleSave = () => {
    updateProfile(formData);
    toast.success("Profile updated successfully.");
    setIsEditModalOpen(false);
  };

  const handleDownloadResume = () => {
    toast.success("Resume preview is available in the prototype.");
  };
  
  const handleChangePhoto = () => {
    toast.info("Profile photo upload is available in the full version.");
  };

  const container: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
          <div className="h-24 md:h-32 bg-gradient-to-r from-primary/80 to-accent/80"></div>
          <CardContent className="px-6 pb-6 relative pt-0">
            <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-12 md:-mt-16 mb-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-card bg-card text-3xl font-semibold shadow-md">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'HV'}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                  onClick={handleChangePhoto}
                >
                  <span className="text-white text-xs font-medium">Change Photo</span>
                </div>
              </div>
              <div className="flex-1 space-y-1 mt-4 md:mt-0">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{profile.fullName}</h1>
                <p className="text-primary font-medium">{profile.title}</p>
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1"><Building className="w-4 h-4" /> {profile.college}</div>
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 md:items-end mt-4 md:mt-0 w-full md:w-auto">
                <div className="flex items-center gap-2 mb-2 w-full md:w-48">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Completion</span>
                      <span className="text-primary">{strength}%</span>
                    </div>
                    <Progress value={strength} className="h-2 bg-secondary" />
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1 md:flex-auto shadow-sm" onClick={() => setFormData(profile)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="title">Professional Title</Label>
                            <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="college">College</Label>
                          <Input id="college" value={formData.college} onChange={(e) => setFormData({...formData, college: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="degree">Degree</Label>
                            <Input id="degree" value={formData.degree} onChange={(e) => setFormData({...formData, degree: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="academicYear">Academic Year</Label>
                            <Input id="academicYear" value={formData.academicYear} onChange={(e) => setFormData({...formData, academicYear: e.target.value})} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Professional Bio</Label>
                          <Textarea id="bio" value={formData.bio} rows={3} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="summary">Professional Summary</Label>
                          <Textarea id="summary" value={formData.summary} rows={3} onChange={(e) => setFormData({...formData, summary: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="github">GitHub</Label>
                            <Input id="github" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input id="linkedin" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Link to={`/portfolio/${profile.fullName.split(' ')[0].toLowerCase()}`} className="flex-1 md:flex-auto">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                      View Public Portfolio <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            {profile.openToOpportunities && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-full w-fit mt-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Open to internships, hackathons and software development opportunities
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Two-Column Layout */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={item}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.summary || profile.bio}
                </p>
                <div className="mt-6 pt-6 border-t border-border/50">
                  <h4 className="text-sm font-semibold mb-2">Career Goal</h4>
                  <p className="text-sm text-muted-foreground">
                    {profile.careerGoal}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-3 rounded-full h-fit">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{profile.degree}</h3>
                    <p className="text-muted-foreground">{profile.college}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="font-normal bg-secondary/50">Currently Pursuing – {profile.academicYear}</Badge>
                      <span>•</span>
                      <span>{profile.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" /> Core Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Categorized Skills rendering */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Programming</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">Java</Badge>
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">C++</Badge>
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">Python</Badge>
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">JavaScript</Badge>
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">TypeScript</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Frontend</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">React</Badge>
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">Next.js</Badge>
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">HTML/CSS</Badge>
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">Tailwind CSS</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Backend</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">Node.js</Badge>
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">Express.js</Badge>
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">NestJS</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Database & Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">MongoDB</Badge>
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">PostgreSQL</Badge>
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">Git</Badge>
                      <Badge variant="secondary" className="bg-secondary/40 font-medium">GitHub</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <motion.div variants={item}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Areas of Interest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map(interest => (
                    <Badge key={interest} variant="outline" className="bg-background/50 backdrop-blur-md">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Social & Professional Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href={profile.github.includes('http') ? profile.github : '#'} className="flex items-center p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50 group cursor-pointer text-sm">
                  <GitBranch className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{profile.github}</span>
                </a>
                <a href={profile.linkedin.includes('http') ? profile.linkedin : '#'} className="flex items-center p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50 group cursor-pointer text-sm">
                  <UserCircle className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-[#0A66C2] transition-colors" />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{profile.linkedin}</span>
                </a>
                <a href={`mailto:${profile.email}`} className="flex items-center p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50 group cursor-pointer text-sm">
                  <Mail className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{profile.email}</span>
                </a>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resume</CardTitle>
                <CardDescription>Resume available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center p-3 bg-secondary/30 rounded-lg mb-4 border border-border/50">
                  <FileText className="w-8 h-8 text-primary mr-3" />
                  <div>
                    <p className="text-sm font-medium">{profile.fullName.replace(/\s+/g, '_')}_Resume.pdf</p>
                    <p className="text-xs text-muted-foreground">PDF Document</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleDownloadResume}>View</Button>
                  <Button className="flex-1" onClick={handleDownloadResume}>Download</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-primary">{strength}%</span>
                </div>
                <Progress value={strength} className="h-2 bg-secondary mb-4" />
                
                <div className="space-y-2 text-sm mt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">✓</div>
                    Basic Information
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">✓</div>
                    Professional Summary
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">✓</div>
                    Education
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold">○</div>
                    Resume verification
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                  Complete your profile to improve your portfolio visibility.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
