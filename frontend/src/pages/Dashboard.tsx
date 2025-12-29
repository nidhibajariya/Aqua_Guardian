import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Users, CheckCircle, Clock, BarChart3, Activity, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MapComponent from '@/components/MapComponent';
import StatusBadge from '@/components/StatusBadge';
import ReportsTimelineChart from '@/components/charts/ReportsTimelineChart';
import PollutionTypesChart from '@/components/charts/PollutionTypesChart';
import ReportStatusChart from '@/components/charts/ReportStatusChart';
import PollutionSeverityGauge from '@/components/charts/PollutionSeverityGauge';
import TrendComparisonChart from '@/components/charts/TrendComparisonChart';
import ModernKPICard from '@/components/charts/ModernKPICard';
import { fetchDashboardStats, fetchReportsTimeline, fetchReportsByType, fetchReportsByStatus, fetchGeographicHeatmap, fetchSeverityDistribution, fetchTrendComparison } from '@/services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    total_reports: 0,
    active_users: 0,
    resolved_reports: 0,
    verified_reports: 0,
    avg_response_time: 'N/A'
  });
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [typesData, setTypesData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [severityData, setSeverityData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, timelineRes, typesRes, statusRes, heatmapRes, severityRes, trendRes] = await Promise.all([
          fetchDashboardStats(),
          fetchReportsTimeline(30),
          fetchReportsByType(),
          fetchReportsByStatus(),
          fetchGeographicHeatmap(),
          fetchSeverityDistribution(),
          fetchTrendComparison(6)
        ]);

        // Debug logging for dashboard data
        console.log('Dashboard Data Status:', {
          stats: !!statsRes,
          timeline: !!timelineRes,
          types: !!typesRes,
          status: !!statusRes,
          heatmap: !!heatmapRes,
          severity: !!severityRes,
          trend: !!trendRes
        });

        if (statsRes) {
          console.log('Stats:', statsRes);
          setStats(statsRes);
        }
        if (timelineRes) setTimelineData(timelineRes);
        if (typesRes) setTypesData(typesRes);
        if (statusRes) setStatusData(statusRes);
        if (heatmapRes) setHeatmapData(heatmapRes);
        if (severityRes) setSeverityData(severityRes);
        if (trendRes) setTrendData(trendRes);

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setIsLoading(false);
        // Don't clear existing data on error - keep showing last successful data
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Helper function to get status label from severity
  const getStatusFromSeverity = (severity: number) => {
    if (severity >= 80) return 'Critical';
    if (severity >= 60) return 'High';
    if (severity >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pollution Monitoring Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time tracking • Last updated: {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernKPICard
          title="Total Reports"
          value={stats.total_reports}
          change={12.5}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="#0ea5e9"
          subtitle="Pollution reports submitted"
        />
        <ModernKPICard
          title="Active Users"
          value={stats.active_users}
          change={8.3}
          icon={<Users className="h-5 w-5" />}
          color="#10b981"
          subtitle="Community members reporting"
        />
        <ModernKPICard
          title="Reports Resolved"
          value={stats.resolved_reports}
          change={15.7}
          icon={<CheckCircle className="h-5 w-5" />}
          color="#8b5cf6"
          subtitle="Issues successfully addressed"
        />
        <ModernKPICard
          title="Avg Response Time"
          value={stats.avg_response_time}
          change={-5.2}
          icon={<Clock className="h-5 w-5" />}
          color="#f59e0b"
          subtitle="Time to investigate reports"
        />
        <ModernKPICard
          title="AI Verified"
          value={stats.verified_reports}
          change={100}
          icon={<CheckCircle className="h-5 w-5" />}
          color="#10b981"
          subtitle="Automatically verified by AI"
        />
      </div>

      {/* Trend Comparison Chart */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-ocean-primary" />
            <span>6-Month Trend Analysis</span>
          </CardTitle>
          <CardDescription>Comprehensive view of reports, resolutions, and response times</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="space-y-3 w-full px-4">
                <div className="h-8 bg-muted/50 rounded animate-pulse"></div>
                <div className="h-8 bg-muted/30 rounded animate-pulse"></div>
                <div className="h-8 bg-muted/40 rounded animate-pulse"></div>
                <div className="h-8 bg-muted/20 rounded animate-pulse"></div>
              </div>
            </div>
          ) : trendData.length > 0 ? (
            <TrendComparisonChart data={trendData} />
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-center px-4 space-y-3">
              <BarChart3 className="h-12 w-12 text-muted-foreground/30" />
              <div>
                <p className="text-muted-foreground font-medium">No trend data available</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Data will appear once reports are submitted</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports Timeline */}
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-ocean-primary" />
              <span>Daily Reports Timeline</span>
            </CardTitle>
            <CardDescription>Report submissions over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="space-y-3 w-full px-4">
                  <div className="h-8 bg-muted/50 rounded animate-pulse"></div>
                  <div className="h-8 bg-muted/30 rounded animate-pulse"></div>
                  <div className="h-8 bg-muted/40 rounded animate-pulse"></div>
                  <div className="h-8 bg-muted/20 rounded animate-pulse"></div>
                </div>
              </div>
            ) : timelineData.length > 0 ? (
              <ReportsTimelineChart data={timelineData} />
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center px-4 space-y-3">
                <TrendingUp className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <p className="text-muted-foreground font-medium">No timeline data available</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Report submissions will appear here over time</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pollution Severity Gauge */}
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-warning" />
              <span>Pollution Severity Distribution</span>
            </CardTitle>
            <CardDescription>Breakdown of reports by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-full max-w-xs mx-auto space-y-4">
                  <div className="h-40 w-40 mx-auto bg-muted/30 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-muted/20 rounded animate-pulse"></div>
                </div>
              </div>
            ) : severityData.length > 0 ? (
              <PollutionSeverityGauge data={severityData} />
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center px-4 space-y-3">
                <AlertTriangle className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <p className="text-muted-foreground font-medium">No severity data available</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Severity distribution will be displayed once reports are classified</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pollution Types */}
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-success" />
              <span>Pollution Types Distribution</span>
            </CardTitle>
            <CardDescription>Breakdown of reported pollution categories</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full px-4">
                  <div className="h-32 bg-muted/50 rounded animate-pulse"></div>
                  <div className="h-32 bg-muted/30 rounded animate-pulse"></div>
                  <div className="h-32 bg-muted/40 rounded animate-pulse"></div>
                  <div className="h-32 bg-muted/20 rounded animate-pulse"></div>
                </div>
              </div>
            ) : typesData.length > 0 ? (
              <PollutionTypesChart data={typesData} />
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center px-4 space-y-3">
                <BarChart3 className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <p className="text-muted-foreground font-medium">No pollution type data available</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Different pollution types will be categorized here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reports by Status */}
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              <span>Reports by Status</span>
            </CardTitle>
            <CardDescription>Current status of all pollution reports</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-full max-w-xs mx-auto space-y-4">
                  <div className="h-40 w-40 mx-auto bg-muted/30 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted/50 rounded animate-pulse"></div>
                    <div className="h-3 bg-muted/30 rounded animate-pulse"></div>
                    <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : statusData.length > 0 ? (
              <ReportStatusChart data={statusData} />
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center px-4 space-y-3">
                <CheckCircle className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <p className="text-muted-foreground font-medium">No status data available</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Report status distribution will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pollution Hotspots Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="ocean-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Interactive Pollution Map</span>
            </CardTitle>
            <CardDescription>Real-time pollution levels across monitored areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <div className="h-full flex items-center justify-center bg-muted/10 rounded">
                  <div className="text-center space-y-2">
                    <div className="h-10 w-10 mx-auto bg-muted/30 rounded-full animate-pulse"></div>
                    <p className="text-sm text-muted-foreground">Loading map data...</p>
                  </div>
                </div>
              ) : heatmapData.length > 0 ? (
                <MapComponent
                  points={heatmapData.map((hotspot, index) => ({
                    id: `hotspot-${index}`,
                    lat: hotspot.lat,
                    lng: hotspot.lng,
                    title: hotspot.location,
                    severity: hotspot.severity,
                    description: `${getStatusFromSeverity(hotspot.severity)} pollution risk`,
                  }))}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-2">
                  <MapPin className="h-10 w-10 text-muted-foreground/30" />
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">No map data available</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Submit reports to populate the map</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="text-lg">Hotspot Rankings</CardTitle>
            <CardDescription>Areas requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : heatmapData.length > 0 ? (
                heatmapData.map((hotspot, index) => {
                  const status = getStatusFromSeverity(hotspot.severity);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card/70 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground text-sm">{hotspot.location}</p>
                        <div className="flex items-center space-x-2">
                          <StatusBadge
                            status={status}
                            variant={
                              status === 'Critical'
                                ? 'danger'
                                : status === 'High'
                                  ? 'warning'
                                  : status === 'Medium'
                                    ? 'info'
                                    : 'success'
                            }
                          />
                          <span className="text-xs text-muted-foreground">{hotspot.severity}%</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 space-y-2">
                  <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground font-medium">No hotspot data available</p>
                  <p className="text-xs text-muted-foreground/70">Critical areas will be ranked here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;