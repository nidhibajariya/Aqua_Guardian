import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Send, AlertTriangle, CheckCircle, Eye, Filter, Clock, Info, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import FileUploader from '@/components/FileUploader';
import ReportCard from '@/components/ReportCard';
import StatusBadge from '@/components/StatusBadge';
import { submitReport, fetchUserReports } from '@/services/api';
import { useEffect } from 'react';

interface PollutionReport {
  id: string;      // The actual UUID
  displayId: string; // The shortened ID for UI
  location: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  reportedBy: string;
  date: string;
  status: string; // Dynamic statuses now
  actionNote?: string;
  updatedAt?: string;
  aiConfidence?: number;
  image?: string;
}

const Report = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filter, setFilter] = useState('All');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedReport, setSelectedReport] = useState<PollutionReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isJoiningCleanup, setIsJoiningCleanup] = useState(false);
  const [activeCleanup, setActiveCleanup] = useState<any>(null);

  const API_BASE_URL = "http://127.0.0.1:8000";

  // Fetch cleanup action details when a report is selected
  useEffect(() => {
    if (selectedReport) {
      fetchCleanupDetails(selectedReport.id);
    } else {
      setActiveCleanup(null);
    }
  }, [selectedReport]);

  const fetchCleanupDetails = async (reportId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cleanup/active`);
      const cleanup = response.data.find((c: any) => c.report_id === reportId);
      setActiveCleanup(cleanup);
    } catch (error) {
      console.error("Error fetching cleanup details:", error);
    }
  };

  const handleJoinCleanup = async () => {
    if (!user || !activeCleanup) {
      toast({
        title: "Action Required",
        description: "Please login to join cleanup activities.",
        variant: "destructive",
      });
      return;
    }

    setIsJoiningCleanup(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("role", "Citizen");

      await axios.post(`${API_BASE_URL}/cleanup/${activeCleanup.id}/join`, formData);

      toast({
        title: "Success",
        description: "You have joined the cleanup team! Check the Community Action page for updates.",
      });
      fetchCleanupDetails(selectedReport!.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Could not join cleanup at this time.",
        variant: "destructive",
      });
    } finally {
      setIsJoiningCleanup(false);
    }
  };

  const [formData, setFormData] = useState({
    location: '',
    type: '',
    severity: 'Medium' as const,
    description: '',
    coordinates: '',
  });

  // State for user's real reports
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch real user reports
  useEffect(() => {
    const loadUserReports = async () => {
      if (!user) return;

      try {
        const data = await fetchUserReports(user.id);

        // Map backend report to frontend PollutionReport interface
        const mappedReports: PollutionReport[] = data.map((r: any) => {
          // Map severity int back to label
          let severityLabel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
          if (r.severity >= 10) severityLabel = 'Critical';
          else if (r.severity >= 8) severityLabel = 'High';
          else if (r.severity >= 5) severityLabel = 'Medium';
          else severityLabel = 'Low';

          // Extract location from description if it was formatted like "{type} at {location}: {description}"
          let location = 'Unknown';
          const match = r.description.match(/ at (.*?):/);
          if (match) location = match[1];

          return {
            id: r.id, // Actual UUID
            displayId: r.id.substring(0, 8).toUpperCase(), // Shorten UUID for display
            location: location,
            type: (r.ai_class || 'Unknown').replace('_', ' '),
            severity: severityLabel,
            description: r.description,
            reportedBy: 'Me',
            date: new Date(r.created_at).toLocaleDateString(),
            status: r.status, // Keep original status string from backend
            actionNote: r.action_note,
            updatedAt: r.updated_at ? new Date(r.updated_at).toLocaleDateString() : undefined,
            aiConfidence: r.ai_confidence
          };
        });

        setReports(mappedReports);
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadUserReports();
  }, [user]);

  // AI Verification State
  const [verificationState, setVerificationState] = useState<'idle' | 'verifying' | 'verified'>('idle');
  const [aiResult, setAiResult] = useState<{ class: string; confidence: number; status?: string } | null>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        setFormData(prev => ({ ...prev, coordinates: `${lat}, ${lng}` }));
        setIsGettingLocation(false);
        toast({
          title: "Location Retrieved",
          description: `Coordinates: ${lat}, ${lng}`,
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Location Error",
          description: "Could not retrieve your location. Please enter manually.",
          variant: "destructive",
        });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location || !formData.type || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Missing Evidence",
        description: "Please upload a photo of the pollution",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a report",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setVerificationState('verifying'); // Start verification UI

    try {
      // Parse coordinates
      let lat = 0;
      let lng = 0;
      if (formData.coordinates) {
        const parts = formData.coordinates.split(',').map(p => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          lat = parts[0];
          lng = parts[1];
        }
      }

      // Map severity to integer
      const severityMap: Record<string, number> = {
        'Low': 1,
        'Medium': 5,
        'High': 8,
        'Critical': 10
      };

      const submitData = new FormData();
      submitData.append('user_id', user.id);
      submitData.append('latitude', lat.toString());
      submitData.append('longitude', lng.toString());
      submitData.append('description', `${formData.type} at ${formData.location}: ${formData.description}`);
      submitData.append('severity', (severityMap[formData.severity] || 5).toString());

      if (selectedFile) {
        submitData.append('file', selectedFile);
      }

      // Execute API call and minimum delay concurrently
      const minDelay = new Promise(resolve => setTimeout(resolve, 3500)); // 3.5s delay
      const [responseData] = await Promise.all([
        submitReport(submitData),
        minDelay
      ]);

      // Re-fetch reports to show the new one
      const updatedReportsData = await fetchUserReports(user.id);
      const mappedReports: PollutionReport[] = updatedReportsData.map((r: any) => {
        let severityLabel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
        if (r.severity >= 10) severityLabel = 'Critical';
        else if (r.severity >= 8) severityLabel = 'High';
        else if (r.severity >= 5) severityLabel = 'Medium';
        else severityLabel = 'Low';

        let location = 'Unknown';
        const match = r.description.match(/ at (.*?):/);
        if (match) location = match[1];

        return {
          id: r.id.substring(0, 8).toUpperCase(),
          location: location,
          type: (r.ai_class || 'Unknown').replace('_', ' '),
          severity: severityLabel,
          description: r.description,
          reportedBy: 'Me',
          date: new Date(r.created_at).toLocaleDateString(),
          status: r.status.charAt(0).toUpperCase() + r.status.slice(1) as any,
        };
      });
      setReports(mappedReports);

      // Backend returns the created report object
      const aiClass = responseData.ai_class;
      const aiConfidence = responseData.ai_confidence;

      if (aiClass) {
        setAiResult({
          class: aiClass,
          confidence: aiConfidence || 0,
          status: responseData.status
        });
        setVerificationState('verified');

        // Close modal after showing result
        setTimeout(() => {
          setVerificationState('idle');
          setAiResult(null);
          toast({
            title: responseData.status === 'verified' ? "Report Auto-Verified!" : "Report Filed Successfully",
            description: responseData.status === 'verified' ?
              "High AI confidence confirmed pollution. Report is now verified." :
              "Your report has been received and is queued for manual review.",
          });

          // Reset form
          setFormData({
            location: '',
            type: '',
            severity: 'Medium',
            description: '',
            coordinates: '',
          });
          setSelectedFile(null);
        }, 4000); // Show result for 4 seconds
      } else {
        // Fallback if no AI result
        setVerificationState('idle');
        toast({
          title: "Report Submitted Successfully!",
          description: "Your report has been filed and is being reviewed",
        });
        // Reset form
        setFormData({
          location: '',
          type: '',
          severity: 'Medium',
          description: '',
          coordinates: '',
        });
        setSelectedFile(null);
      }

    } catch (error) {
      console.error('Error submitting report:', error);
      setVerificationState('idle');
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Dimensions unknown. Please share console logs.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = filter === 'All' ? reports : reports.filter(report => report.status === filter);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 relative">
      {/* AI Verification Modal Overlay */}
      {verificationState !== 'idle' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-background border-ocean-primary shadow-2xl animate-in fade-in zoom-in duration-300">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">
                {verificationState === 'verifying' ? 'AI Analysis in Progress' : 'Analysis Complete'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-6">
              {verificationState === 'verifying' ? (
                <>
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-ocean-primary rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-ocean-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium text-foreground">Verifying Evidence...</p>
                    <p className="text-sm text-muted-foreground">Analyzing pollution patterns and severity</p>
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center animate-in zoom-in duration-300 ${aiResult?.status === 'verified' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {aiResult?.status === 'verified' ? (
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    ) : (
                      <Eye className="h-12 w-12 text-orange-600" />
                    )}
                  </div>
                  <div className="text-center space-y-4 w-full">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {aiResult?.status === 'verified' ? 'System Verified' : 'Manual Review Needed'}
                      </h3>
                      <p className="text-muted-foreground">AI Confidence: {((aiResult?.confidence || 0) * 100).toFixed(1)}%</p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg border border-border w-full">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Detected Type:</span>
                        <span className="font-semibold text-foreground capitalize">{aiResult?.class?.replace('_', ' ')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-ocean-primary h-2.5 rounded-full transition-all duration-1000"
                          style={{ width: `${(aiResult?.confidence || 0) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground pt-2">
                      Redirecting to dashboard...
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Pollution Reporting</h1>
        <p className="text-muted-foreground">
          Report water pollution incidents to help protect our ecosystems. Your reports make a difference.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Report Form */}
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Submit Pollution Report</span>
            </CardTitle>
            <CardDescription>
              Provide detailed information about the pollution incident you've observed
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location" className="text-foreground">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Enter specific location (e.g., Mumbai Harbor, Sector 5)"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 bg-background border-border focus:border-ocean-primary"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="coordinates" className="text-foreground">GPS Coordinates (Optional)</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="coordinates"
                      placeholder="Latitude, Longitude"
                      value={formData.coordinates}
                      onChange={(e) => setFormData(prev => ({ ...prev, coordinates: e.target.value }))}
                      className="bg-background border-border focus:border-ocean-primary"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="type" className="text-foreground">Pollution Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="mt-1 bg-background border-border focus:border-ocean-primary">
                      <SelectValue placeholder="Select pollution type" />
                    </SelectTrigger>
                    <SelectContent className="ocean-card border-border">
                      <SelectItem value="Industrial Discharge">Industrial Discharge</SelectItem>
                      <SelectItem value="Plastic Pollution">Plastic Pollution</SelectItem>
                      <SelectItem value="Oil Spill">Oil Spill</SelectItem>
                      <SelectItem value="Sewage Overflow">Sewage Overflow</SelectItem>
                      <SelectItem value="Chemical Contamination">Chemical Contamination</SelectItem>
                      <SelectItem value="Agricultural Runoff">Agricultural Runoff</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="severity" className="text-foreground">Severity Level</Label>
                  <Select value={formData.severity} onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger className="mt-1 bg-background border-border focus:border-ocean-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="ocean-card border-border">
                      <SelectItem value="Low">Low - Minor Impact</SelectItem>
                      <SelectItem value="Medium">Medium - Moderate Impact</SelectItem>
                      <SelectItem value="High">High - Significant Impact</SelectItem>
                      <SelectItem value="Critical">Critical - Immediate Action Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-foreground">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed description of what you observed, including time, weather conditions, and any other relevant information..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 min-h-[100px] bg-background border-border focus:border-ocean-primary"
                    required
                  />
                </div>

                <div>
                  <Label className="text-foreground">Photo Evidence *</Label>
                  <FileUploader onFileSelect={setSelectedFile} />
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected file: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full wave-animation"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Submitting Report..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Reporting Guidelines</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">What to Include:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-ocean-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Exact location with landmarks</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-ocean-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Date and time of observation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-ocean-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Clear photos or videos if possible</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-ocean-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Weather conditions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-ocean-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Suspected source if known</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Safety First:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <span>Do not touch contaminated water</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <span>Avoid inhaling fumes or vapors</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <span>Report from a safe distance</span>
                </li>
              </ul>
            </div>

            <div className="bg-card/50 p-4 rounded-lg border border-border">
              <h5 className="font-medium text-foreground mb-2">Emergency Situations</h5>
              <p className="text-sm text-muted-foreground">
                For immediate threats to human health or environment, also contact local authorities:
                <span className="block mt-1 font-medium text-ocean-primary">Emergency: 112</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Reports */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle>Your Field Reports</CardTitle>
          <CardDescription>Track your contributions to ocean conservation</CardDescription>
        </CardHeader>
        <CardContent>
          {isInitialLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 border-2 border-ocean-primary border-t-transparent animate-spin rounded-full"></div>
            </div>
          ) : reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.slice(0, 2).map((report) => (
                <ReportCard key={report.id} {...report} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
              <Eye className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">You haven't submitted any reports yet.</p>
              <p className="text-sm text-muted-foreground/70">Your recent reports will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submitted Reports */}
      <Card className="ocean-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-ocean-primary" />
                <span>Recent Reports History</span>
              </CardTitle>
              <CardDescription>
                Track status and details of your submitted pollution reports
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Reports</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Investigating">Investigating</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isInitialLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="h-8 w-8 border-2 border-ocean-primary border-t-transparent animate-spin rounded-full"></div>
                        <p className="text-muted-foreground">Loading your reports...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">#{report.id}</TableCell>
                      <TableCell>{report.location}</TableCell>
                      <TableCell className="capitalize">{report.type}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={report.severity}
                          variant={
                            report.severity === 'Critical'
                              ? 'danger'
                              : report.severity === 'High'
                                ? 'warning'
                                : report.severity === 'Medium'
                                  ? 'info'
                                  : 'success'
                          }
                        />
                      </TableCell>
                      <TableCell>{report.updatedAt || report.date}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={report.status}
                          variant={
                            report.status === 'Action completed' || report.status === 'Verified'
                              ? 'success'
                              : report.status === 'Action in progress' || report.status === 'Investigating'
                                ? 'info'
                                : report.status === 'Sent to authorities'
                                  ? 'warning'
                                  : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      {filter === 'All'
                        ? "You haven't submitted any reports yet. Use the form above to file your first report."
                        : `No reports found with status "${filter}".`
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Report Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-2xl">
              <ShieldCheck className="h-6 w-6 text-ocean-primary" />
              <span>Report Tracking: #{selectedReport?.displayId}</span>
            </DialogTitle>
            <DialogDescription>
              Detailed view of pollution report and authority actions
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Location</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-ocean-primary" />
                      <span className="font-medium">{selectedReport.location}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Pollution Type</Label>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium capitalize">{selectedReport.type}</p>
                      {selectedReport.aiConfidence !== undefined && (
                        <div className="text-[10px] bg-ocean-primary/10 text-ocean-primary px-1.5 py-0.5 rounded-full font-bold">
                          AI: {(selectedReport.aiConfidence * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                    <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md line-clamp-3">
                      {selectedReport.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Current Action Status</Label>
                    <div className="pt-1">
                      <StatusBadge
                        status={selectedReport.status}
                        variant={
                          selectedReport.status === 'Action completed' || selectedReport.status === 'Verified'
                            ? 'success'
                            : selectedReport.status === 'Action in progress' || selectedReport.status === 'Investigating'
                              ? 'info'
                              : 'warning'
                        }
                        className="text-sm px-3 py-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Last Updated Date</Label>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedReport.updatedAt || selectedReport.date}</span>
                    </div>
                  </div>

                  {selectedReport.actionNote && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Authority Action Note</Label>
                      <div className="bg-ocean-primary/5 border border-ocean-primary/20 p-3 rounded-md italic text-sm">
                        "{selectedReport.actionNote}"
                      </div>
                    </div>
                  )}

                  {activeCleanup && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Community Participation</Label>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-ocean-primary bg-ocean-primary/10 px-2 py-0.5 rounded-full">
                          <Users className="h-3 w-3" />
                          {activeCleanup.participants_count || 0} INVOLVED
                        </div>
                      </div>
                      <Progress value={activeCleanup.progress} className="h-2 mb-4" />

                      {activeCleanup.status !== 'completed' ? (
                        <Button
                          onClick={handleJoinCleanup}
                          disabled={isJoiningCleanup}
                          className="w-full wave-animation"
                        >
                          {isJoiningCleanup ? "Joining..." : "Join Cleanup Activity"}
                        </Button>
                      ) : (
                        <div className="text-center py-2 bg-success/10 text-success rounded-md text-xs font-medium border border-success/20">
                          Cleanup Successfully Completed!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4 pt-4 border-t border-border">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Action Timeline</Label>
                <div className="relative space-y-4 left-1">
                  {[
                    { label: 'Submitted', key: 'Submitted' },
                    { label: 'Verified by AI', key: 'Verified by AI' },
                    { label: 'Sent to authorities', key: 'Sent to authorities' },
                    { label: 'Action in progress', key: 'Action in progress' },
                    { label: 'Action completed', key: 'Action completed' }
                  ].map((step, index, arr) => {
                    const statusOrder = ['Submitted', 'Verified by AI', 'Sent to authorities', 'Action in progress', 'Action completed'];

                    // Helper to find index with legacy support
                    const getStatusIndex = (status: string) => {
                      const s = status.toLowerCase();
                      if (s === 'submitted' || s === 'pending') return 0;
                      if (s === 'verified by ai' || s === 'verified') return 1;
                      if (s === 'sent to authorities') return 2;
                      if (s === 'action in progress' || s === 'investigating') return 3;
                      if (s === 'action completed' || s === 'resolved') return 4;
                      return 0; // Fallback
                    };

                    const currentStatusIndex = getStatusIndex(selectedReport.status);
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = currentStatusIndex === index;

                    return (
                      <div key={step.key} className="flex items-start space-x-3 relative">
                        {index < arr.length - 1 && (
                          <div className={`absolute left-[11px] top-[22px] w-[2px] h-[calc(100%+8px)] ${isCompleted ? 'bg-success' : 'bg-muted'}`} />
                        )}
                        <div className={`mt-1.5 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors duration-300 ${isCompleted ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-2 ring-success ring-offset-2 ring-offset-background' : ''}`}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${isCurrent ? 'text-success' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-success font-bold animate-pulse">CURRENT STATUS</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Report;