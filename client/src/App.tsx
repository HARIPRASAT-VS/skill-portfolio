import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';

import Dashboard from './pages/Dashboard';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import Profile from './pages/Profile';

import PublicPortfolio from './pages/PublicPortfolio';
import Achievements from './pages/Achievements';
import { LayoutTemplate, Construction, Sparkles, Award, BarChart3 } from 'lucide-react';

const ComingSoon = ({ title, description, icon: Icon }: { title: string, description: string, icon: any }) => (
  <div className="space-y-8 pb-12 w-full max-w-5xl mx-auto">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
    
    <div className="border-dashed bg-card/30 border border-border/50 rounded-xl flex flex-col items-center justify-center text-center p-16 md:p-24 min-h-[50vh] relative overflow-hidden shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
        <div className="bg-gradient-to-br from-card to-secondary border border-border/50 p-5 rounded-2xl relative shadow-md">
          <Icon className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 z-10 flex items-center justify-center gap-3">
        Under Construction 
        <span className="text-primary bg-primary/10 px-3 py-1 rounded-full text-sm font-bold tracking-widest uppercase inline-flex items-center gap-1.5 shadow-sm border border-primary/20">
          <Sparkles className="w-3.5 h-3.5"/> Coming Soon
        </span>
      </h2>
      
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed z-10">
        We're working hard to bring you the best experience for managing your {title.toLowerCase()}. Stay tuned for updates!
      </p>
    </div>
  </div>
);

// Placeholder Pages
const LandingPage = () => <div className="p-8 text-center"><h1 className="text-4xl font-bold mb-4">SkillFolio</h1><p className="mb-4">Build a portfolio that speaks for you.</p><a href="/dashboard" className="text-primary hover:underline">Go to Dashboard</a></div>;
const Certifications = () => <ComingSoon title="Certifications" description="Manage, verify, and elegantly showcase your professional certifications." icon={Award} />;
const Analytics = () => <ComingSoon title="Analytics" description="Deep dive into your portfolio's performance and recruiter engagement metrics." icon={BarChart3} />;
const PortfolioPreview = () => <div className="p-6"><h1 className="text-2xl font-bold">Portfolio Preview</h1></div>;

import { useEffect } from 'react';
import { usePortfolioStore } from './store/usePortfolioStore';

function App() {
  const fetchData = usePortfolioStore((state) => state.fetchData);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="skills" element={<Skills />} />
          <Route path="projects" element={<Projects />} />
          <Route path="certifications" element={<Certifications />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        <Route path="/portfolio/:username" element={<PublicPortfolio />} />
        <Route path="/portfolio/preview" element={<PortfolioPreview />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
