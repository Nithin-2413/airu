import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, PieChart, TrendingUp, Users, Award, 
  Target, Activity, Home, ArrowLeft, Download, RefreshCw 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { 
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell, 
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import apiClient from '../utils/api';

const Analytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, screeningsRes] = await Promise.all([
        apiClient.get('/analytics/dashboard'),
        apiClient.get('/screenings')
      ]);
      setAnalytics(analyticsRes.data);
      setScreenings(screeningsRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Status distribution data for pie chart
  const statusData = analytics ? [
    { name: 'New', value: analytics.status_breakdown.new, color: '#3b82f6' },
    { name: 'Shortlisted', value: analytics.status_breakdown.shortlisted, color: '#10b981' },
    { name: 'Interviewed', value: analytics.status_breakdown.interviewed, color: '#f59e0b' },
    { name: 'Hired', value: analytics.status_breakdown.hired, color: '#8b5cf6' },
    { name: 'Rejected', value: analytics.status_breakdown.rejected, color: '#ef4444' }
  ] : [];

  // Score distribution data
  const scoreData = screenings
    .filter(s => s.match_score > 0)
    .reduce((acc, s) => {
      const range = Math.floor(s.match_score / 10) * 10;
      const key = `${range}-${range + 10}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const scoreDistribution = Object.entries(scoreData)
    .map(([range, count]) => ({ range, count }))
    .sort((a, b) => parseInt(a.range) - parseInt(b.range));

  // Top jobs data
  const topJobsData = analytics?.top_jobs.slice(0, 5).map(job => ({
    name: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
    applications: job.application_count
  })) || [];

  // Trend data (mock data - you can replace with real historical data)
  const trendData = [
    { month: 'Jan', candidates: 45, hired: 5 },
    { month: 'Feb', candidates: 52, hired: 7 },
    { month: 'Mar', candidates: 68, hired: 9 },
    { month: 'Apr', candidates: 71, hired: 11 },
    { month: 'May', candidates: 85, hired: 13 },
    { month: 'Jun', candidates: analytics?.total_screenings || 95, hired: analytics?.status_breakdown.hired || 15 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh-premium dark:bg-gradient-mesh-premium flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh-premium dark:bg-gradient-mesh-premium">
      {/* Header */}
      <div className="glass-card sticky top-0 z-50 border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="hover:bg-secondary/80 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Analytics Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Premium insights and performance metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={loadAnalytics}
                className="hover:bg-secondary/80 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        
        {/* KPI Cards with 3D Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ 
              y: -8, 
              boxShadow: "0 20px 60px rgba(59, 130, 246, 0.3)",
              transition: { duration: 0.3, ease: "easeInOut" }
            }}
            className="glass-card-3d p-6 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors duration-300">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-xs font-medium text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  +12% this month
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-1">{analytics?.total_screenings || 0}</h3>
              <p className="text-sm text-muted-foreground">Total Candidates</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ 
              y: -8, 
              boxShadow: "0 20px 60px rgba(16, 185, 129, 0.3)",
              transition: { duration: 0.3, ease: "easeInOut" }
            }}
            className="glass-card-3d p-6 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors duration-300">
                  <Target className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-xs font-medium text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  +8% accuracy
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-1">{analytics?.average_scores.match_score || 0}%</h3>
              <p className="text-sm text-muted-foreground">Avg Match Score</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ 
              y: -8, 
              boxShadow: "0 20px 60px rgba(139, 92, 246, 0.3)",
              transition: { duration: 0.3, ease: "easeInOut" }
            }}
            className="glass-card-3d p-6 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors duration-300">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-xs font-medium text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Top performers
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-1">{analytics?.status_breakdown.shortlisted || 0}</h3>
              <p className="text-sm text-muted-foreground">Shortlisted</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ 
              y: -8, 
              boxShadow: "0 20px 60px rgba(245, 158, 11, 0.3)",
              transition: { duration: 0.3, ease: "easeInOut" }
            }}
            className="glass-card-3d p-6 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors duration-300">
                  <Activity className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-xs font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Success rate
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-1">{analytics?.conversion_rate || 0}%</h3>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </div>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* 3D Pie Chart - Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card-3d p-6 group"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Status Distribution
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Candidate status breakdown
                </p>
              </div>
            </div>
            <div className="h-[350px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    className="drop-shadow-2xl hover:drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-500"
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 3D Bar Chart - Top Jobs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card-3d p-6 group"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Top Job Positions
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Most applied positions
                </p>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topJobsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <Bar 
                    dataKey="applications" 
                    fill="url(#colorGradient)"
                    radius={[8, 8, 0, 0]}
                    className="hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300"
                  >
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Score Distribution Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card-3d p-6 group"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Score Distribution
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Match score ranges
                </p>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="range" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#scoreGradient)"
                    radius={[8, 8, 0, 0]}
                    className="hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all duration-300"
                  >
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Trend Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card-3d p-6 group"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Hiring Trends
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  6-month performance overview
                </p>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="candidatesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="hiredGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="candidates" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fill="url(#candidatesGradient)"
                    className="hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hired" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fill="url(#hiredGradient)"
                    className="hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all duration-300"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
