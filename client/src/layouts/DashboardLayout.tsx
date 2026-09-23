import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, User, Code2, FolderKanban, 
  Award, Star, BarChart3, Settings, HelpCircle,
  Bell, Search, Menu
} from 'lucide-react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Toaster } from '../components/ui/sonner';
import { Button } from '../components/ui/button';

export function DashboardLayout() {
  const location = useLocation();
  const profile = usePortfolioStore((state) => state.profile);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    { name: 'Skills', path: '/dashboard/skills', icon: Code2 },
    { name: 'Projects', path: '/dashboard/projects', icon: FolderKanban },
    { name: 'Certifications', path: '/dashboard/certifications', icon: Award },
    { name: 'Achievements', path: '/dashboard/achievements', icon: Star },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-secondary/30">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">S</span>
            SkillFolio
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 mt-2 px-2">
            My Portfolio
          </div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                location.pathname === item.path 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <Link to="/help" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <HelpCircle className="w-4 h-4" />
            Help
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border">
          <div className="flex items-center gap-4 md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
            <span className="font-bold text-primary">SkillFolio</span>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md bg-secondary/50 rounded-md px-3 py-1.5 border border-transparent focus-within:border-border focus-within:bg-card transition-colors">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm ml-2 w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border-2 border-card"></span>
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium leading-none mb-1">{profile.fullName || 'User'}</div>
                <div className="text-xs text-muted-foreground leading-none">Student</div>
              </div>
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {profile.fullName ? profile.fullName.charAt(0) : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>

      <Toaster />
    </div>
  );
}
