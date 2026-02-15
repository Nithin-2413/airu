import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Brain, CheckCircle2, Zap, Calendar, FileText, TrendingUp, Star, Users, Shield, Award, Rocket, Play } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden smooth-scroll">
      
      {/* Premium iOS Background - Mesh Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 gradient-mesh-ios opacity-50" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsla(211, 100%, 50%, 0.3) 0%, transparent 70%)',
            x: mousePosition.x * 3,
            y: mousePosition.y * 3,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsla(271, 81%, 56%, 0.3) 0%, transparent 70%)',
            x: mousePosition.x * -2,
            y: mousePosition.y * -2,
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* iOS-style Navigation - Glassmorphism */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glass-nav"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="relative group">
                <div className="w-11 h-11 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-2 transition-all duration-300 group-hover:shadow-depth-3 group-hover:scale-105">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl gradient-ios-blue opacity-40 blur-lg group-hover:opacity-60 transition-opacity" />
              </div>
              <span className="text-2xl font-bold tracking-tightest bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Recruit-AI
              </span>
            </motion.div>
            
            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <ThemeToggle />
              <Button
                data-testid="nav-get-started-button"
                onClick={handleGetStarted}
                className="ios-button-primary h-11 px-6 shadow-depth-2 hover:shadow-depth-3 active:scale-95"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - iOS Premium */}
      <section className="relative pt-32 pb-24 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ opacity, y }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="inline-flex items-center gap-2.5 glass rounded-full px-5 py-2.5 shadow-depth-1"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
                <span className="text-sm font-semibold tracking-apple">AI-Powered Recruitment</span>
              </motion.div>

              {/* Heading */}
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tightest">
                  <span className="text-foreground">Transform Your</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                    Hiring Process
                  </span>
                </h1>

                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl font-light tracking-apple">
                  Screen thousands of resumes in seconds with AI precision. Find the perfect candidates 10× faster with intelligent automation.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  data-testid="hero-get-started-button"
                  onClick={handleGetStarted}
                  size="lg"
                  className="ios-button-primary h-16 px-10 text-lg shadow-depth-3 hover:shadow-depth-4 group"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
                
                <Button
                  size="lg"
                  className="ios-button-secondary h-16 px-10 text-lg group"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats - iOS Style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-8 pt-8"
              >
                {[
                  { value: '5,000+', label: 'Companies' },
                  { value: '1M+', label: 'Resumes Screened' },
                  { value: '94%', label: 'Accuracy Rate' },
                ].map((stat, idx) => (
                  <div key={idx}>
                    <div className="text-4xl font-bold tracking-tightest">{stat.value}</div>
                    <div className="text-sm text-muted-foreground tracking-apple">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Floating Glass Cards */}
            <div className="relative h-[600px] hidden lg:block">
              
              {/* Card 1: Perfect Match */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{
                  x: mousePosition.x * 0.5,
                  y: mousePosition.y * 0.5,
                }}
                className="absolute top-0 right-0 w-80 glass-card shadow-depth-3 hover-lift"
                data-testid="floating-card-candidate"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl gradient-ios-green flex items-center justify-center shadow-depth-2">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tightest">96%</div>
                    <div className="text-sm text-success font-semibold tracking-apple">Perfect Match</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-lg font-semibold tracking-tight">Alex Rivera</div>
                  <div className="text-sm text-muted-foreground">Senior Full Stack Engineer</div>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="ios-badge-primary">React · Node.js</span>
                    <span className="ios-badge ios-badge-success">8 YoE</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: AI Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{
                  x: mousePosition.x * -0.3,
                  y: mousePosition.y * 0.3,
                }}
                className="absolute top-32 left-0 w-72 glass-card shadow-depth-3 hover-lift"
                data-testid="floating-card-analysis"
              >
                <Brain className="w-10 h-10 text-primary mb-4" />
                <div className="text-xl font-bold tracking-tight mb-2">AI Deep Scan Active</div>
                <div className="text-sm text-muted-foreground mb-4 tracking-apple">Analyzing 847 resumes...</div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Progress</span>
                    <span className="font-bold text-primary">73%</span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full gradient-ios-blue"
                      initial={{ width: 0 }}
                      animate={{ width: '73%' }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                style={{
                  x: mousePosition.x * 0.4,
                  y: mousePosition.y * -0.4,
                }}
                className="absolute bottom-0 right-12 w-64 glass-card shadow-depth-3 hover-lift"
                data-testid="floating-card-stats"
              >
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-8 h-8 text-accent" />
                  <span className="text-xs text-muted-foreground font-medium tracking-apple">Last 30 Days</span>
                </div>
                
                <div className="text-4xl font-bold tracking-tightest mb-1">2,847</div>
                <div className="text-sm text-muted-foreground mb-4 tracking-apple">Candidates Screened</div>
                
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Time Saved</span>
                    <span className="font-bold">142 hrs</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - iOS Cards */}
      <section className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tightest mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Hire Smarter
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto tracking-apple">
              Powerful AI tools designed to streamline your recruitment process
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: 'AI-Powered Screening',
                description: 'Intelligent resume analysis using advanced machine learning to match candidates perfectly.',
                gradient: 'gradient-ios-blue',
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Lightning Fast',
                description: 'Process hundreds of resumes in seconds. Save countless hours of manual screening.',
                gradient: 'gradient-ios-purple',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Bias-Free Evaluation',
                description: 'Objective assessments based purely on skills, experience, and qualifications.',
                gradient: 'gradient-ios-green',
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: 'Smart Scheduling',
                description: 'Seamlessly manage interviews with integrated calendar and automated reminders.',
                gradient: 'gradient-ios-pink',
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: 'Professional Emails',
                description: 'Generate polished, personalized communication with AI-assisted email drafts.',
                gradient: 'gradient-ios-blue',
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Analytics Dashboard',
                description: 'Track hiring metrics and gain insights to optimize your recruitment strategy.',
                gradient: 'gradient-ios-purple',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="glass-card hover-lift group"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.gradient} flex items-center justify-center mb-5 shadow-depth-2 group-hover:shadow-depth-3 group-hover:scale-110 transition-all duration-300`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                
                <h3 className="text-2xl font-bold tracking-tight mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed tracking-apple">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card text-center p-12 lg:p-16"
          >
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            
            <h3 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
              Trusted by Leading Companies
            </h3>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 tracking-apple leading-relaxed">
              "Recruit-AI transformed our hiring process. We've reduced time-to-hire by 70% while significantly improving candidate quality. It's like having an expert recruiter working 24/7."
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-2">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Sarah Johnson</div>
                <div className="text-sm text-muted-foreground">Head of HR, TechCorp</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Final Push */}
      <section className="relative py-32 z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-4">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold tracking-apple">Start Your Free Trial</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tightest mb-6">
              Ready to Revolutionize
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Your Hiring?
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 tracking-apple">
              Join thousands of companies using AI to hire better, faster, and smarter.
            </p>
            
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="ios-button-primary h-16 px-12 text-lg shadow-depth-4 hover:shadow-depth-4 hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal iOS Style */}
      <footer className="relative z-10 border-t border-border backdrop-blur-ios">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-1">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tightest">Recruit-AI</span>
            </div>
            
            <div className="text-sm text-muted-foreground tracking-apple">
              © 2024 Recruit-AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
