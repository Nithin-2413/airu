import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Upload, History, Home, Calendar as CalendarIcon, Mail, TrendingUp, Users, CheckCircle, Clock, ArrowRight, Brain, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import apiClient from '../utils/api';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalResumes: 0,
    totalScreenings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const jobsResponse = await apiClient.get('/jobs?status=active');
      const screeningsResponse = await apiClient.get('/screenings');
      setStats({
        activeJobs: jobsResponse.data.length,
        totalScreenings: screeningsResponse.data.length,
        totalResumes: 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="dashboard-loading">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground tracking-apple">Loading your workspace...</p>
        </motion.div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: <FileText className="w-7 h-7" />,
      title: 'Create Job',
      description: 'Post new position',
      gradient: 'gradient-ios-blue',
      onClick: () => navigate('/jobs'),
      testId: 'action-create-jd-button'
    },
    {
      icon: <Upload className="w-7 h-7" />,
      title: 'Screen Resumes',
      description: 'Upload & analyze',
      gradient: 'gradient-ios-purple',
      onClick: () => navigate('/screening'),
      testId: 'action-screen-resumes-button'
    },
    {
      icon: <CalendarIcon className="w-7 h-7" />,
      title: 'Schedule',
      description: 'Manage interviews',
      gradient: 'gradient-ios-pink',
      onClick: () => navigate('/calendar'),
      testId: 'action-schedule-button'
    },
    {
      icon: <Mail className="w-7 h-7" />,
      title: 'Email Drafts',
      description: 'Generate emails',
      gradient: 'gradient-ios-green',
      onClick: () => navigate('/emails'),
      testId: 'action-email-button'
    },
    {
      icon: <History className="w-7 h-7" />,
      title: 'View History',
      description: 'Past screenings',
      gradient: 'gradient-ios-blue',
      onClick: () => navigate('/history'),
      testId: 'action-history-button'
    },
  ];

  const statCards = [
    {
      icon: <FileText className="w-6 h-6" />,
      label: 'Active Jobs',
      value: stats.activeJobs,
      gradient: 'gradient-ios-blue',
      testId: 'stat-active-jobs'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      label: 'Total Screenings',
      value: stats.totalScreenings,
      gradient: 'gradient-ios-green',
      testId: 'stat-screenings'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Success Rate',
      value: '94%',
      gradient: 'gradient-ios-purple',
      testId: 'stat-success-rate'
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" data-testid="dashboard-container">
      
      {/* Background Gradient */}
      <div className="fixed inset-0 gradient-mesh-ios opacity-30 pointer-events-none" />

      {/* iOS Navigation */}
      <motion.nav 
        className="glass-nav sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo & Nav Links */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="w-10 h-10 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-2">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tightest">AIRecruiter</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2">
                <Button 
                  variant="ghost"
                  className="text-foreground font-semibold tracking-apple rounded-xl"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/jobs')}
                  className="text-muted-foreground hover:text-foreground tracking-apple rounded-xl"
                >
                  Jobs
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/screening')}
                  className="text-muted-foreground hover:text-foreground tracking-apple rounded-xl"
                >
                  Screening
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/history')}
                  className="text-muted-foreground hover:text-foreground tracking-apple rounded-xl"
                >
                  History
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/calendar')}
                  className="text-muted-foreground hover:text-foreground tracking-apple rounded-xl"
                >
                  Calendar
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/emails')}
                  className="text-muted-foreground hover:text-foreground tracking-apple rounded-xl"
                >
                  Emails
                </Button>
              </div>
            </div>
            
            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
                className="rounded-xl hover:bg-secondary"
              >
                <Home className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tightest mb-4">
            Welcome back
          </h1>
          <p className="text-xl text-muted-foreground tracking-apple">
            Let's find your next great hire
          </p>
        </motion.div>

        {/* Stats Cards - iOS Widget Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + idx * 0.1 }}
              className="glass-card hover-lift group"
              data-testid={stat.testId}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl ${stat.gradient} flex items-center justify-center shadow-depth-2 group-hover:shadow-depth-3 group-hover:scale-110 transition-all duration-300`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <TrendingUp className="w-5 h-5 text-success opacity-60" />
              </div>
              
              <div className="text-4xl font-bold tracking-tightest mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground tracking-apple">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Quick Actions - Large Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-8"
          >
            <div className="glass-card" data-testid="quick-actions-card">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Quick Actions</h2>
                <p className="text-muted-foreground tracking-apple">Start your workflow</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + idx * 0.1 }}
                    onClick={action.onClick}
                    data-testid={action.testId}
                    className="glass rounded-2xl p-6 text-left group hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${action.gradient} flex items-center justify-center mb-4 shadow-depth-2 group-hover:shadow-depth-3 group-hover:scale-110 transition-all duration-300`}>
                      <div className="text-white">{action.icon}</div>
                    </div>
                    
                    <h3 className="text-xl font-bold tracking-tight mb-1 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground tracking-apple">
                      {action.description}
                    </p>
                    
                    <ArrowRight className="w-5 h-5 mt-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar - AI Assistant Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-4 space-y-6"
          >
            
            {/* AI Assistant Widget */}
            <div className="glass-card group hover-lift">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl gradient-ios-purple flex items-center justify-center shadow-depth-2 group-hover:shadow-depth-3 group-hover:scale-110 transition-all duration-300">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold tracking-tight mb-1">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground tracking-apple">Ready to help</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="glass-light rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-warning" />
                    <span className="text-sm font-semibold tracking-apple">Quick Tip</span>
                  </div>
                  <p className="text-sm text-muted-foreground tracking-apple leading-relaxed">
                    Upload multiple resumes at once for faster batch screening
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity Widget */}
            <div className="glass-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold tracking-tight">Recent Activity</h3>
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'Screenings completed', value: '12', time: '2h ago' },
                  { label: 'Jobs posted', value: '3', time: '5h ago' },
                  { label: 'Interviews scheduled', value: '8', time: '1d ago' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <div className="text-sm font-semibold tracking-apple">{activity.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{activity.time}</div>
                    </div>
                    <div className="text-2xl font-bold tracking-tightest">{activity.value}</div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 glass-card text-center p-12"
        >
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold tracking-apple">Pro Tip</span>
            </div>
            
            <h3 className="text-3xl font-bold tracking-tight mb-4">
              Streamline Your Hiring Today
            </h3>
            <p className="text-muted-foreground tracking-apple mb-8 leading-relaxed">
              Start by creating a job description, then upload resumes to get AI-powered screening results instantly.
            </p>
            
            <Button
              onClick={() => navigate('/jobs')}
              className="ios-button-primary h-14 px-8 shadow-depth-3 hover:shadow-depth-4 group"
            >
              Create Your First Job
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </div>
        </motion.div>

      </main>
    </div>
  );
};

export default Dashboard;
