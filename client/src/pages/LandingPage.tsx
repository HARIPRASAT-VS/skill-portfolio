import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp, Globe, LayoutTemplate } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function LandingPage() {
  const [demoUsername, setDemoUsername] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/portfolio/demo/username')
      .then((res: any) => {
        if (res.data && res.data.username) {
          setDemoUsername(res.data.username);
        }
      })
      .catch((err) => console.error("Failed to fetch demo username", err));
  }, []);
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-50 flex flex-col font-sans overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      {/* Navbar */}
      <header className="w-full px-6 py-4 md:px-12 flex items-center justify-between z-10 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <LayoutTemplate className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SkillFolio</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to={demoUsername ? `/portfolio/${demoUsername}` : '#'} className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
            Preview Example
          </Link>
          <Link to="/dashboard">
            <Button className="bg-white text-black hover:bg-slate-200 rounded-full px-6 font-semibold">
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative mt-12 md:mt-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 mr-2" /> Voted #1 Student Portfolio Platform
            </Badge>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400"
          >
            Build. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">Prove.</span> Show.
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed"
          >
            A powerful digital portfolio platform designed for students. Manage your skills, projects, certifications, and achievements in one professional, unified dashboard.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-full h-14 px-8 text-lg font-semibold shadow-xl shadow-indigo-500/25 transition-all hover:scale-105">
                Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to={demoUsername ? `/portfolio/${demoUsername}` : '#'} className="w-full sm:w-auto">
              <Button size="lg" variant="outline" disabled={!demoUsername} className="w-full sm:w-auto h-14 px-8 rounded-full text-lg font-semibold border-white/20 text-white hover:bg-white/5 hover:text-white transition-all hover:scale-105 bg-black/50 backdrop-blur-md">
                View Portfolio <Globe className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Mockup Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, type: "spring" }}
          className="w-full max-w-5xl mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 rounded-xl pointer-events-none" />
          <div className="border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-violet-500/10 bg-black/60 backdrop-blur-xl p-2 md:p-4">
            <div className="flex items-center gap-2 px-2 pb-4 pt-2 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            {/* Abstract UI representation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 opacity-70">
               <div className="col-span-1 md:col-span-1 space-y-4">
                  <div className="h-48 rounded-lg bg-white/5 animate-pulse" />
                  <div className="h-32 rounded-lg bg-white/5 animate-pulse delay-75" />
               </div>
               <div className="col-span-1 md:col-span-2 space-y-4">
                  <div className="h-24 rounded-lg bg-indigo-500/10 border border-indigo-500/20" />
                  <div className="h-64 rounded-lg bg-white/5 animate-pulse delay-150" />
               </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Trust / Value Section */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/20">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Skills + Evidence</h3>
            <p className="text-slate-400 leading-relaxed">Stop just listing skills. Link them directly to your real-world projects, certifications, and achievements for undeniable proof.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/20">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Portfolio Strength</h3>
            <p className="text-slate-400 leading-relaxed">Gamify your career growth. Watch your profile strength increase as you add more experience, projects, and verified credentials.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-6 border border-violet-500/20">
              <Globe className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Professional Showcase</h3>
            <p className="text-slate-400 leading-relaxed">Generate a stunning, responsive, public-facing digital portfolio instantly. Share your unique link with recruiters and stand out.</p>
          </motion.div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-sm z-10 bg-black/40 backdrop-blur-md">
        <p>© {new Date().getFullYear()} SkillFolio Platform. Built for the modern student.</p>
      </footer>
    </div>
  );
}
