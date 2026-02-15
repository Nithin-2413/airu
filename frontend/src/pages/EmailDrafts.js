import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Copy, RefreshCw, Send, Sparkles, Home, Loader2, CheckCircle, Edit3, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import apiClient from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const EmailDrafts = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email_type: 'interview_invitation',
    candidate_name: '',
    job_title: '',
    company_name: 'Our Company',
    interview_date: '',
    interview_time: '',
    interview_location: '',
    tone: 'professional',
    additional_details: ''
  });

  const emailTypeLabels = {
    interview_invitation: 'Interview Invitation',
    reschedule: 'Interview Reschedule',
    offer_letter: 'Job Offer Letter',
    rejection: 'Rejection Notice',
    follow_up: 'Follow-up After Interview'
  };

  const handleGenerate = async () => {
    if (!formData.candidate_name) {
      toast.error('Please enter candidate name');
      return;
    }

    setIsGenerating(true);
    setGeneratedEmail(null);

    try {
      const response = await apiClient.post('/emails/generate-draft', formData);
      setGeneratedEmail(response.data);
      setIsEditing(false);
      toast.success('Email draft generated successfully!');
    } catch (error) {
      console.error('Failed to generate email:', error);
      toast.error('Failed to generate email draft');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedEmail) return;
    
    const emailText = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    navigator.clipboard.writeText(emailText);
    toast.success('Copied to clipboard!');
  };

  const handleReset = () => {
    setGeneratedEmail(null);
    setIsEditing(false);
    setFormData({
      email_type: 'interview_invitation',
      candidate_name: '',
      job_title: '',
      company_name: 'Our Company',
      interview_date: '',
      interview_time: '',
      interview_location: '',
      tone: 'professional',
      additional_details: ''
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh-ios opacity-20 pointer-events-none" />

      {/* iOS Navigation */}
      <motion.nav 
        className="glass-nav sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="w-10 h-10 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-2">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tightest">Recruit-AI</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/dashboard')} className="tracking-apple rounded-xl">Dashboard</Button>
                <Button variant="ghost" onClick={() => navigate('/jobs')} className="tracking-apple rounded-xl">Jobs</Button>
                <Button variant="ghost" onClick={() => navigate('/screening')} className="tracking-apple rounded-xl">Screening</Button>
                <Button variant="ghost" onClick={() => navigate('/history')} className="tracking-apple rounded-xl">History</Button>
                <Button variant="ghost" onClick={() => navigate('/calendar')} className="tracking-apple rounded-xl">Calendar</Button>
                <Button variant="ghost" className="text-foreground font-semibold tracking-apple rounded-xl">Emails</Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
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
          className="mb-8"
        >
          <h1 className="text-5xl font-bold tracking-tightest mb-2">Email Drafts</h1>
          <p className="text-xl text-muted-foreground tracking-apple">Generate professional HR emails with AI</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Configuration Panel - macOS Style */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card"
          >
            <div className="border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-2">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Email Configuration</h2>
                  <p className="text-sm text-muted-foreground tracking-apple">Fill in the details</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              
              {/* Email Type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold tracking-apple">Email Type</Label>
                <Select 
                  value={formData.email_type} 
                  onValueChange={(value) => setFormData({ ...formData, email_type: value })}
                >
                  <SelectTrigger className="ios-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-2 border-border">
                    {Object.entries(emailTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Candidate Name */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold tracking-apple">Candidate Name *</Label>
                <Input
                  value={formData.candidate_name}
                  onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                  placeholder="John Doe"
                  className="ios-input"
                />
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold tracking-apple">Job Title</Label>
                <Input
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="Senior Software Engineer"
                  className="ios-input"
                />
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold tracking-apple">Company Name</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Your Company"
                  className="ios-input"
                />
              </div>

              {/* Interview Date & Time */}
              {formData.email_type === 'interview_invitation' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold tracking-apple">Interview Date</Label>
                      <Input
                        type="date"
                        value={formData.interview_date}
                        onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                        className="ios-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold tracking-apple">Time</Label>
                      <Input
                        type="time"
                        value={formData.interview_time}
                        onChange={(e) => setFormData({ ...formData, interview_time: e.target.value })}
                        className="ios-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold tracking-apple">Location</Label>
                    <Input
                      value={formData.interview_location}
                      onChange={(e) => setFormData({ ...formData, interview_location: e.target.value })}
                      placeholder="Zoom, Office, etc."
                      className="ios-input"
                    />
                  </div>
                </>
              )}

              {/* Tone */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold tracking-apple">Tone</Label>
                <Select 
                  value={formData.tone} 
                  onValueChange={(value) => setFormData({ ...formData, tone: value })}
                >
                  <SelectTrigger className="ios-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-2 border-border">
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Details */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold tracking-apple">Additional Details</Label>
                <Textarea
                  value={formData.additional_details}
                  onChange={(e) => setFormData({ ...formData, additional_details: e.target.value })}
                  placeholder="Any specific instructions or details..."
                  className="ios-textarea"
                  rows={3}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.candidate_name}
                className="w-full ios-button-primary h-14 shadow-depth-2 hover:shadow-depth-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Email
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Right: Email Preview - macOS Mail Style */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card flex flex-col"
          >
            <div className="border-b border-border pb-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Email Preview</h2>
                  <p className="text-sm text-muted-foreground tracking-apple">Your generated draft</p>
                </div>
                
                {generatedEmail && !isEditing && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="rounded-xl hover:bg-secondary"
                      title="Edit"
                    >
                      <Edit3 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyToClipboard}
                      className="rounded-xl hover:bg-secondary"
                      title="Copy"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleReset}
                      className="rounded-xl hover:bg-secondary"
                      title="Reset"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full py-20"
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
                    <p className="text-muted-foreground tracking-apple">Crafting your email...</p>
                  </motion.div>
                ) : generatedEmail ? (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Subject Line */}
                    <div className="glass-light rounded-2xl p-5">
                      <Label className="text-xs font-semibold text-muted-foreground tracking-apple uppercase mb-2 block">
                        Subject
                      </Label>
                      {isEditing ? (
                        <Input
                          value={generatedEmail.subject}
                          onChange={(e) => setGeneratedEmail({ ...generatedEmail, subject: e.target.value })}
                          className="ios-input text-lg font-semibold"
                        />
                      ) : (
                        <h3 className="text-lg font-bold tracking-tight">{generatedEmail.subject}</h3>
                      )}
                    </div>

                    {/* Email Body */}
                    <div className="glass-light rounded-2xl p-5">
                      <Label className="text-xs font-semibold text-muted-foreground tracking-apple uppercase mb-3 block">
                        Message
                      </Label>
                      {isEditing ? (
                        <Textarea
                          value={generatedEmail.body}
                          onChange={(e) => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                          className="ios-textarea text-[15px] leading-relaxed"
                          rows={16}
                        />
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-foreground tracking-apple">
                            {generatedEmail.body}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {isEditing ? (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setIsEditing(false)}
                          className="flex-1 ios-button-primary shadow-depth-2"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setIsEditing(false)}
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          onClick={handleCopyToClipboard}
                          className="flex-1 ios-button-secondary shadow-depth-1"
                        >
                          <Copy className="w-5 h-5 mr-2" />
                          Copy to Clipboard
                        </Button>
                        <Button
                          onClick={handleReset}
                          variant="ghost"
                          className="rounded-xl"
                        >
                          <RefreshCw className="w-5 h-5 mr-2" />
                          New Draft
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full py-20 text-center"
                  >
                    <div className="w-20 h-20 rounded-3xl gradient-ios-blue flex items-center justify-center mb-6 shadow-depth-2">
                      <Mail className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight mb-3">No Email Yet</h3>
                    <p className="text-muted-foreground tracking-apple max-w-sm">
                      Fill in the details on the left and click "Generate Email" to create your professional draft
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass-card"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-ios-purple flex items-center justify-center flex-shrink-0 shadow-depth-2">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Pro Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground tracking-apple">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Be specific with candidate names and job titles for personalized emails</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Include interview dates and times for invitation emails</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Choose the right tone based on your company culture</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>You can edit the generated email before copying it</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
};

export default EmailDrafts;
