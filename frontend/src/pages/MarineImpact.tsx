import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Fish, AlertTriangle, TrendingUp, Brain, BarChart3, Waves, Target } from 'lucide-react';
import PollutionSourcesChart from '@/components/charts/PollutionSourcesChart';
import ConservationEffectivenessChart from '@/components/charts/ConservationEffectivenessChart';
import EcosystemHealthRadar from '@/components/charts/EcosystemHealthRadar';
import CircularKPI from '@/components/charts/CircularKPI';
import { fetchMarineImpactMetrics } from '@/services/api';

const MarineImpact = () => {
  const [impactData, setImpactData] = useState<any[]>([]);
  const [aiPredictions, setAiPredictions] = useState<any[]>([]);
  const [pollutionSources, setPollutionSources] = useState<any[]>([]);
  const [ecosystemHealth, setEcosystemHealth] = useState<any>({
    water_quality: 0,
    biodiversity: 0,
    pollution_level: 0,
    conservation_effort: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch marine impact data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarineImpactMetrics();
        setImpactData(data.species_impact || []);
        setAiPredictions(data.ai_predictions || []);
        setPollutionSources(data.pollution_sources || []);
        setEcosystemHealth(data.ecosystem_health || {
          water_quality: 0,
          biodiversity: 0,
          pollution_level: 0,
          conservation_effort: 0
        });
      } catch (error) {
        console.error('Failed to fetch marine impact data', error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      case 'Endangered': return 'bg-warning text-warning-foreground';
      case 'Vulnerable': return 'bg-ocean-primary text-primary-foreground';
      case 'Stable': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-destructive';
      case 'High': return 'text-warning';
      case 'Moderate': return 'text-ocean-primary';
      case 'Low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Marine Impact Analysis</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          AI-powered predictions and analysis of pollution effects on marine ecosystems and biodiversity
        </p>
        <div className="flex items-center justify-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live Data • Last updated: {currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* AI Predictions */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-ocean-primary" />
            <span>AI-Powered Ecosystem Predictions</span>
          </CardTitle>
          <CardDescription>
            Machine learning models analyze current trends to predict future marine ecosystem health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {aiPredictions.map((prediction, index) => (
              <div key={index} className="p-4 bg-card/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{prediction.timeframe}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(prediction.severity)}>
                      {prediction.severity} Risk
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {prediction.confidence}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{prediction.prediction}</p>
                <div className="mt-3">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span>Prediction Confidence</span>
                    <span>{prediction.confidence}%</span>
                  </div>
                  <Progress value={prediction.confidence} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ecosystem Health Radar */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-ocean-primary" />
            <span>Ecosystem Health Radar</span>
          </CardTitle>
          <CardDescription>
            Multi-dimensional view of marine ecosystem health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EcosystemHealthRadar />
        </CardContent>
      </Card>

      {/* Species Impact Assessment */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fish className="h-5 w-5 text-ocean-light" />
            <span>Species Impact Assessment</span>
          </CardTitle>
          <CardDescription>
            Current population status and projected changes for key marine species
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {impactData.map((species, index) => (
              <div key={index} className="p-4 bg-card/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-lg">{species.species}</h3>
                  <Badge className={getStatusColor(species.conservationStatus)}>
                    {species.conservationStatus}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Current Population</span>
                      <span className="font-semibold text-foreground">
                        {species.currentPopulation.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">5-Year Projection</span>
                      <span className={`font-semibold ${species.projectedChange < 0 ? 'text-destructive' : 'text-success'}`}>
                        {species.projectedChange > 0 ? '+' : ''}{species.projectedChange}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Primary Threats</h4>
                    <div className="flex flex-wrap gap-1">
                      {species.threats.map((threat, threatIndex) => (
                        <Badge key={threatIndex} variant="outline" className="text-xs">
                          {threat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pollution Sources Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-warning" />
              <span>Pollution Sources Impact</span>
            </CardTitle>
            <CardDescription>
              Major pollution sources affecting marine ecosystems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PollutionSourcesChart data={pollutionSources} />
            <div className="mt-4 space-y-4">
              {pollutionSources.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{source.source}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{source.impact}%</span>
                      <Badge
                        variant="outline"
                        className={
                          source.trend === 'Increasing' ? 'text-destructive border-destructive' :
                            source.trend === 'Decreasing' ? 'text-success border-success' :
                              'text-ocean-primary border-ocean-primary'
                        }
                      >
                        {source.trend}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={source.impact} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span>Conservation Effectiveness</span>
            </CardTitle>
            <CardDescription>
              Impact of current conservation efforts over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConservationEffectivenessChart />
            <div className="mt-6 space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-success mb-2">78%</div>
                <p className="text-sm text-muted-foreground">Overall Conservation Success Rate</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Protected Areas Established</span>
                  <span className="font-semibold text-foreground">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Species Recovery Programs</span>
                  <span className="font-semibold text-foreground">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pollution Reduction Achieved</span>
                  <span className="font-semibold text-success">32%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Community Engagement Score</span>
                  <span className="font-semibold text-ocean-primary">9.2/10</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Recommendations */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>AI-Generated Action Recommendations</span>
          </CardTitle>
          <CardDescription>
            Data-driven suggestions for immediate conservation action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <h3 className="font-semibold text-destructive mb-2">Immediate Action Required</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Implement stricter industrial discharge controls</li>
                <li>• Establish emergency response protocols</li>
                <li>• Increase monitoring in critical zones</li>
              </ul>
            </div>

            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
              <h3 className="font-semibold text-warning mb-2">Medium-term Strategy</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Expand plastic waste collection programs</li>
                <li>• Develop sustainable fishing guidelines</li>
                <li>• Create marine protected areas</li>
              </ul>
            </div>

            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <h3 className="font-semibold text-success mb-2">Long-term Vision</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Achieve 50% pollution reduction by 2030</li>
                <li>• Restore degraded marine habitats</li>
                <li>• Build resilient coastal communities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Ecosystem Health */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Waves className="h-5 w-5 text-ocean-primary" />
            <span>Real-time Ecosystem Health Index</span>
          </CardTitle>
          <CardDescription>
            Live assessment of marine ecosystem vitality across monitored regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <CircularKPI value={ecosystemHealth.water_quality} max={100} label="Water Quality Index" color="#10b981" size={140} />
            <CircularKPI value={ecosystemHealth.biodiversity} max={100} label="Biodiversity Score" color="#0ea5e9" size={140} />
            <CircularKPI value={ecosystemHealth.pollution_level} max={100} label="Pollution Level" color="#f59e0b" size={140} />
            <CircularKPI value={ecosystemHealth.conservation_effort} max={100} label="Conservation Effort" color="#8b5cf6" size={140} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarineImpact;