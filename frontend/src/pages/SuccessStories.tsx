import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, TrendingUp, Award, Droplets, Fish } from 'lucide-react';
import successChilika from '@/assets/success_story_chilika.png';
import successMumbai from '@/assets/success_story_mumbai.png';
import successKerala from '@/assets/success_story_kerala.png';
import { fetchSuccessStories } from '@/services/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessStories = () => {
  const [stories, setStories] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStories = async () => {
      try {
        const data = await fetchSuccessStories();
        setStories(data);
      } catch (error) {
        console.error("Failed to fetch success stories", error);
      }
    };
    loadStories();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Model Success': return 'bg-success text-success-foreground';
      case 'Ongoing Success': return 'bg-ocean-primary text-primary-foreground';
      case 'Significant Progress': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const overallStats = {
    totalProjects: 12,
    waterBodiesRestored: 8,
    speciesRecovered: 156,
    communitiesImpacted: 45,
    pollutionReduced: 68,
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Success Stories</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Witness the transformative power of community action and scientific intervention
          in restoring our water ecosystems across India
        </p>
      </div>

      {/* Overall Impact Stats */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-warning" />
            <span>Collective Impact Achievement</span>
          </CardTitle>
          <CardDescription>
            Combined results from all successful water restoration projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-ocean-primary mb-2">
                {overallStats.totalProjects}
              </div>
              <div className="text-sm text-muted-foreground">Restoration Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">
                {overallStats.waterBodiesRestored}
              </div>
              <div className="text-sm text-muted-foreground">Water Bodies Restored</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {overallStats.speciesRecovered}
              </div>
              <div className="text-sm text-muted-foreground">Species Recovered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ocean-light mb-2">
                {overallStats.communitiesImpacted}
              </div>
              <div className="text-sm text-muted-foreground">Communities Impacted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning mb-2">
                {overallStats.pollutionReduced}%
              </div>
              <div className="text-sm text-muted-foreground">Avg. Pollution Reduced</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Stories */}
      <div className="space-y-12">
        {stories.map((story, index) => (
          <Card key={story.id} className="ocean-card overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="relative h-64 lg:h-auto">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent lg:bg-gradient-to-r" />
                <div className="absolute top-4 left-4">
                  <Badge className={getStatusColor(story.status)}>
                    {story.status}
                  </Badge>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{story.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{story.location}</span>
                    <span>•</span>
                    <span>{story.timeframe}</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">{story.description}</p>
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-ocean-primary" />
                      <span className="text-sm font-medium text-foreground">Water Quality</span>
                    </div>
                    <div className="text-2xl font-bold text-ocean-primary">
                      +{story.impact.waterQualityImproved}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Fish className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-foreground">Species Recovered</span>
                    </div>
                    <div className="text-2xl font-bold text-success">
                      {story.impact.speciesRecovered}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">Lives Impacted</span>
                    </div>
                    <div className="text-2xl font-bold text-accent">
                      {story.impact.livesImpacted.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium text-foreground">Pollution Reduced</span>
                    </div>
                    <div className="text-2xl font-bold text-warning">
                      -{story.impact.pollutionReduced}%
                    </div>
                  </div>
                </div>

                {/* Key Results */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Key Achievements</span>
                  </h3>
                  <ul className="space-y-2">
                    {Array.isArray(story.results) && story.results.map((result: string, resultIndex: number) => (
                      <li key={resultIndex} className="flex items-start space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stakeholders */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">Key Stakeholders</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(story.stakeholders) && story.stakeholders.map((stakeholder: string, stakeholderIndex: number) => (
                      <Badge key={stakeholderIndex} variant="outline" className="text-xs">
                        {stakeholder}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="ocean-card text-center">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Be Part of the Next Success Story
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            These transformations happened because communities took action.
            Your water body could be the next success story in our conservation efforts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/report')}
              className="px-6 py-3 bg-ocean-primary text-primary-foreground rounded-lg font-medium wave-animation cursor-pointer"
            >
              Report a Pollution Issue
            </button>
            <button
              onClick={() => navigate('/marine-impact')}
              className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-card/50 transition-colors cursor-pointer"
            >
              Join a Cleanup Drive
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessStories;