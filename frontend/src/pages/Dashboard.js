import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, FileText, Upload, History, Home, Calendar as CalendarIcon, Mail, 
  TrendingUp, Users, CheckCircle, Clock, ArrowRight, Brain, Zap, Target,
  Search, Filter, ChevronDown, Download, MoreVertical, Eye, Send, X,
  Award, AlertCircle, TrendingDown, Activity, BarChart3, PieChart,
  Briefcase, Star, UserCheck, UserX, UserPlus, Layers, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import apiClient from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Loader from '../components/Loader';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateDetail, setShowCandidateDetail] = useState(false);
  
  // Data state
  const [analytics, setAnalytics] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  
  // View state
  const [activeView, setActiveView] = useState('table'); // table, kanban, analytics

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [analyticsRes, screeningsRes, jobsRes] = await Promise.all([
        apiClient.get('/analytics/dashboard'),
        apiClient.get('/screenings'),
        apiClient.get('/jobs')
      ]);
      
      setAnalytics(analyticsRes.data);
      setScreenings(screeningsRes.data);
      setAllCandidates(screeningsRes.data);
      setJobs(jobsRes.data);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    let filtered = [...allCandidates];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Score filter
    if (scoreFilter !== 'all') {
      if (scoreFilter === 'high') filtered = filtered.filter(c => c.match_score >= 80);
      if (scoreFilter === 'medium') filtered = filtered.filter(c => c.match_score >= 60 && c.match_score < 80);
      if (scoreFilter === 'low') filtered = filtered.filter(c => c.match_score < 60);
    }
    
    // Job filter
    if (jobFilter !== 'all') {
      filtered = filtered.filter(c => c.job_id === jobFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'date-asc') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'score-desc') return b.match_score - a.match_score;
      if (sortBy === 'score-asc') return a.match_score - b.match_score;
      if (sortBy === 'name-asc') return (a.candidate_name || '').localeCompare(b.candidate_name || '');
      if (sortBy === 'name-desc') return (b.candidate_name || '').localeCompare(a.candidate_name || '');
      return 0;
    });
    
    return filtered;
  }, [allCandidates, searchQuery, statusFilter, scoreFilter, jobFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Analytics calculations
  const statusBreakdown = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: 'New', value: analytics.status_breakdown.new, color: '#3b82f6' },
      { name: 'Shortlisted', value: analytics.status_breakdown.shortlisted, color: '#10b981' },
      { name: 'Interviewed', value: analytics.status_breakdown.interviewed, color: '#f59e0b' },
      { name: 'Hired', value: analytics.status_breakdown.hired, color: '#8b5cf6' },
      { name: 'Rejected', value: analytics.status_breakdown.rejected, color: '#ef4444' }
    ];
  }, [analytics]);

  const scoreDistribution = useMemo(() => {
    const ranges = { '0-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    allCandidates.forEach(c => {
      const score = c.match_score;
      if (score <= 40) ranges['0-40']++;
      else if (score <= 60) ranges['41-60']++;
      else if (score <= 80) ranges['61-80']++;
      else ranges['81-100']++;
    });
    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  }, [allCandidates]);

  // Bulk actions
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedCandidates.length === 0) {
      toast.error('No candidates selected');
      return;
    }
    
    try {
      await apiClient.post('/screenings/bulk-update-status', {
        screening_ids: selectedCandidates,
        status: newStatus
      });
      toast.success(`Updated ${selectedCandidates.length} candidate(s)`);
      setSelectedCandidates([]);
      loadAllData();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/screenings/export/csv', {
        params: {
          job_id: jobFilter !== 'all' ? jobFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `candidates-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export completed');
    } catch (error) {
      console.error('Failed to export:', error);
      toast.error('Failed to export data');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-success/10 border-success';
    if (score >= 60) return 'bg-warning/10 border-warning';
    return 'bg-destructive/10 border-destructive';
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-primary/10 text-primary border-primary',
      shortlisted: 'bg-success/10 text-success border-success',
      interviewed: 'bg-warning/10 text-warning border-warning',
      hired: 'bg-accent/10 text-accent border-accent',
      rejected: 'bg-destructive/10 text-destructive border-destructive'
    };
    return colors[status] || colors.new;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader />
          <p className="text-muted-foreground tracking-apple mt-4">Loading Intelligence Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      
      {/* Premium Background */}
      <div className="fixed inset-0 gradient-mesh-premium-light opacity-40 pointer-events-none" />
      <div className="fixed inset-0 gradient-mesh-premium opacity-30 pointer-events-none" />

      {/* Navigation */}
      <motion.nav 
        className="glass-nav sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="w-10 h-10 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-2">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tightest">AIRecruiter</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2">
                <Button variant="ghost" className="text-foreground font-semibold tracking-apple rounded-xl">
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => navigate('/jobs')} className="tracking-apple rounded-xl">
                  Jobs
                </Button>
                <Button variant="ghost" onClick={() => navigate('/screening')} className="tracking-apple rounded-xl">
                  Screening
                </Button>
                <Button variant="ghost" onClick={() => navigate('/history')} className="tracking-apple rounded-xl">
                  History
                </Button>
                <Button variant="ghost" onClick={() => navigate('/calendar')} className="tracking-apple rounded-xl">
                  Calendar
                </Button>
                <Button variant="ghost" onClick={() => navigate('/emails')} className="tracking-apple rounded-xl">
                  Emails
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                className="rounded-xl"
                disabled={refreshing}
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
                <Home className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 lg:px-12 py-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold tracking-tightest mb-2">Hiring Intelligence</h1>
              <p className="text-xl text-muted-foreground tracking-apple">
                Enterprise-grade recruitment analytics and management
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/screening')}
                className="ios-button-primary shadow-depth-2"
              >
                <Upload className="w-5 h-5 mr-2" />
                Screen Candidates
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="glass-card hover-lift group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-2 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div className="text-4xl font-bold tracking-tightest mb-1">
              {analytics?.total_screenings || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Candidates</div>
          </div>

          <div className="glass-card hover-lift group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl gradient-ios-green flex items-center justify-center shadow-depth-2 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div className="text-4xl font-bold tracking-tightest mb-1">
              {analytics?.average_scores.match_score || 0}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Match Score</div>
          </div>

          <div className="glass-card hover-lift group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl gradient-ios-purple flex items-center justify-center shadow-depth-2 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div className="text-4xl font-bold tracking-tightest mb-1">
              {analytics?.status_breakdown.shortlisted || 0}
            </div>
            <div className="text-sm text-muted-foreground">Shortlisted</div>
          </div>

          <div className="glass-card hover-lift group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl gradient-ios-pink flex items-center justify-center shadow-depth-2 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <Star className="w-5 h-5 text-warning" />
            </div>
            <div className="text-4xl font-bold tracking-tightest mb-1">
              {analytics?.conversion_rate || 0}%
            </div>
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
          </div>
        </motion.div>

        {/* View Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 glass rounded-2xl p-2 w-fit">
            <Button
              variant={activeView === 'table' ? 'default' : 'ghost'}
              onClick={() => setActiveView('table')}
              className="rounded-xl"
            >
              <Layers className="w-4 h-4 mr-2" />
              Candidate Table
            </Button>
            <Button
              variant={activeView === 'kanban' ? 'default' : 'ghost'}
              onClick={() => setActiveView('kanban')}
              className="rounded-xl"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Pipeline
            </Button>
            <Button
              variant={activeView === 'analytics' ? 'default' : 'ghost'}
              onClick={() => setActiveView('analytics')}
              className="rounded-xl"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </motion.div>

        {/* Candidate Table View */}
        {activeView === 'table' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
          >
            {/* Filters and Search */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search candidates, jobs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 ios-input"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] ios-input">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="interviewed">Interviewed</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={scoreFilter} onValueChange={setScoreFilter}>
                    <SelectTrigger className="w-[150px] ios-input">
                      <SelectValue placeholder="Score" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="high">High (80+)</SelectItem>
                      <SelectItem value="medium">Medium (60-79)</SelectItem>
                      <SelectItem value="low">Low (&lt;60)</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={jobFilter} onValueChange={setJobFilter}>
                    <SelectTrigger className="w-[200px] ios-input">
                      <SelectValue placeholder="Job" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Jobs</SelectItem>
                      {jobs.map(job => (
                        <SelectItem key={job.job_id} value={job.job_id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px] ios-input">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Latest First</SelectItem>
                      <SelectItem value="date-asc">Oldest First</SelectItem>
                      <SelectItem value="score-desc">Score: High to Low</SelectItem>
                      <SelectItem value="score-asc">Score: Low to High</SelectItem>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                      <SelectItem value="name-desc">Name: Z to A</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="ios-button-secondary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedCandidates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-3 p-4 glass-light rounded-xl"
                >
                  <span className="text-sm font-semibold">
                    {selectedCandidates.length} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusUpdate('shortlisted')}
                      className="rounded-xl"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Shortlist
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusUpdate('rejected')}
                      className="rounded-xl"
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedCandidates([])}
                    className="ml-auto"
                  >
                    Clear
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-left">
                    <th className="p-4 font-semibold text-sm">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.length === paginatedCandidates.length && paginatedCandidates.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCandidates(paginatedCandidates.map(c => c.screening_id));
                          } else {
                            setSelectedCandidates([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="p-4 font-semibold text-sm">Candidate</th>
                    <th className="p-4 font-semibold text-sm">Job</th>
                    <th className="p-4 font-semibold text-sm">Match Score</th>
                    <th className="p-4 font-semibold text-sm">Skills</th>
                    <th className="p-4 font-semibold text-sm">Experience</th>
                    <th className="p-4 font-semibold text-sm">AI Summary</th>
                    <th className="p-4 font-semibold text-sm">Status</th>
                    <th className="p-4 font-semibold text-sm">Action</th>
                    <th className="p-4 font-semibold text-sm"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCandidates.map((candidate, idx) => (
                    <motion.tr
                      key={candidate.screening_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-border hover:bg-secondary/50 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(candidate.screening_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCandidates([...selectedCandidates, candidate.screening_id]);
                            } else {
                              setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.screening_id));
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-semibold">{candidate.candidate_name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{candidate.filename}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{candidate.job_title || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{candidate.job_department}</div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getScoreBgColor(candidate.match_score)}`}>
                          <div className={`text-lg font-bold ${getScoreColor(candidate.match_score)}`}>
                            {candidate.match_score}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold">{candidate.skills_score}%</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold">{candidate.experience_score}%</div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="text-sm text-muted-foreground italic line-clamp-2" title={candidate.summary}>
                          {candidate.summary || 'No summary available'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(candidate.status)}`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                          candidate.recommended_action === 'Interview' ? 'bg-success/10 text-success' :
                          candidate.recommended_action === 'Maybe' ? 'bg-warning/10 text-warning' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {candidate.recommended_action}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setShowCandidateDetail(true);
                          }}
                          className="rounded-xl"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filteredCandidates.length === 0 && (
                <div className="text-center py-20">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No candidates found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredCandidates.length > 0 && (
              <div className="p-6 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(val) => {
                    setItemsPerPage(parseInt(val));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-[80px] ios-input h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredCandidates.length)} of {filteredCandidates.length}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-xl"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Kanban Pipeline View */}
        {activeView === 'kanban' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="overflow-x-auto pb-4"
          >
            <div className="flex gap-6 min-w-max">
              {['new', 'shortlisted', 'interviewed', 'hired', 'rejected'].map(status => {
                const statusCandidates = allCandidates.filter(c => c.status === status);
                return (
                  <div key={status} className="w-80 flex-shrink-0">
                    <div className="glass-card">
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold capitalize">{status}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                            {statusCandidates.length}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                        {statusCandidates.map((candidate, idx) => (
                          <motion.div
                            key={candidate.screening_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-light rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setShowCandidateDetail(true);
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{candidate.candidate_name || 'Unknown'}</h4>
                                <p className="text-xs text-muted-foreground">{candidate.job_title}</p>
                              </div>
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${getScoreBgColor(candidate.match_score)}`}>
                                {candidate.match_score}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Skills</span>
                                <span className="font-semibold">{candidate.skills_score}%</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Experience</span>
                                <span className="font-semibold">{candidate.experience_score}%</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-border">
                              <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                                candidate.recommended_action === 'Interview' ? 'bg-success/10 text-success' :
                                candidate.recommended_action === 'Maybe' ? 'bg-warning/10 text-warning' :
                                'bg-destructive/10 text-destructive'
                              }`}>
                                {candidate.recommended_action}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                        
                        {statusCandidates.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            No candidates
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="glass-card">
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-bold">Candidate Status Distribution</h3>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Score Distribution */}
              <div className="glass-card">
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-bold">Match Score Distribution</h3>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Average Scores */}
              <div className="glass-card">
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-bold">Average Scores Breakdown</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { label: 'Match Score', value: analytics.average_scores.match_score, color: 'bg-primary' },
                      { label: 'Experience Score', value: analytics.average_scores.experience_score, color: 'bg-success' },
                      { label: 'Skills Score', value: analytics.average_scores.skills_score, color: 'bg-warning' },
                      { label: 'Keyword Score', value: analytics.average_scores.keyword_score, color: 'bg-accent' }
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">{item.label}</span>
                          <span className="text-lg font-bold">{item.value}%</span>
                        </div>
                        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ delay: 0.5 + idx * 0.1, duration: 0.8 }}
                            className={`h-full ${item.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Jobs */}
              <div className="glass-card">
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-bold">Top Performing Jobs</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.top_jobs.slice(0, 5).map((job, idx) => (
                      <motion.div
                        key={job.job_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="flex items-center justify-between p-4 glass-light rounded-xl"
                      >
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{job.job_title}</div>
                          <div className="text-xs text-muted-foreground">
                            {job.candidate_count} candidates
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl font-bold ${getScoreColor(job.avg_match_score)}`}>
                            {job.avg_match_score}
                          </div>
                          <Award className="w-5 h-5 text-warning" />
                        </div>
                      </motion.div>
                    ))}
                    
                    {analytics.top_jobs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No job data available yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* Candidate Detail Modal */}
      <Dialog open={showCandidateDetail} onOpenChange={setShowCandidateDetail}>
        <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader className="border-b border-border pb-4">
                <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                  <span>{selectedCandidate.candidate_name || 'Unknown Candidate'}</span>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${getScoreBgColor(selectedCandidate.match_score)}`}>
                    {selectedCandidate.match_score}
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-6">
                {/* Quick Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-light rounded-xl p-4">
                    <div className="text-sm text-muted-foreground mb-1">Job Role</div>
                    <div className="font-semibold">{selectedCandidate.job_title}</div>
                  </div>
                  <div className="glass-light rounded-xl p-4">
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedCandidate.status)}`}>
                      {selectedCandidate.status}
                    </span>
                  </div>
                  <div className="glass-light rounded-xl p-4">
                    <div className="text-sm text-muted-foreground mb-1">Recommendation</div>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                      selectedCandidate.recommended_action === 'Interview' ? 'bg-success/10 text-success' :
                      selectedCandidate.recommended_action === 'Maybe' ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {selectedCandidate.recommended_action}
                    </span>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div>
                  <h3 className="text-lg font-bold mb-4">ATS Score Breakdown</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Match Score', value: selectedCandidate.match_score, icon: Target },
                      { label: 'Experience Score', value: selectedCandidate.experience_score, icon: Briefcase },
                      { label: 'Skills Score', value: selectedCandidate.skills_score, icon: Award },
                      { label: 'Keyword Score', value: selectedCandidate.keyword_score, icon: Star }
                    ].map((score, idx) => (
                      <div key={idx} className="glass-light rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <score.icon className="w-5 h-5 text-primary" />
                          <span className="text-sm font-semibold">{score.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  score.value >= 80 ? 'bg-success' :
                                  score.value >= 60 ? 'bg-warning' :
                                  'bg-destructive'
                                }`}
                                style={{ width: `${score.value}%` }}
                              />
                            </div>
                          </div>
                          <div className={`text-xl font-bold ${getScoreColor(score.value)}`}>
                            {score.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="text-lg font-bold mb-3">Summary</h3>
                  <div className="glass-light rounded-xl p-4">
                    <p className="text-sm leading-relaxed">{selectedCandidate.summary}</p>
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <h3 className="text-lg font-bold mb-3">Strengths</h3>
                  <div className="space-y-2">
                    {selectedCandidate.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-start gap-3 glass-light rounded-xl p-3">
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaps */}
                {selectedCandidate.gaps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-3">Skill Gaps</h3>
                    <div className="space-y-2">
                      {selectedCandidate.gaps.map((gap, idx) => (
                        <div key={idx} className="flex items-start gap-3 glass-light rounded-xl p-3">
                          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{gap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Highlights */}
                <div>
                  <h3 className="text-lg font-bold mb-3">Key Highlights</h3>
                  <div className="space-y-2">
                    {selectedCandidate.key_highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-3 glass-light rounded-xl p-3">
                        <Star className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div>
                  <h3 className="text-lg font-bold mb-3">Detailed Analysis</h3>
                  <div className="glass-light rounded-xl p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedCandidate.detailed_analysis}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => {
                      navigate('/emails', { state: { candidateName: selectedCandidate.candidate_name } });
                    }}
                    className="ios-button-primary flex-1"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/calendar', { state: { candidateName: selectedCandidate.candidate_name } });
                    }}
                    variant="outline"
                    className="ios-button-secondary flex-1"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Dashboard;
