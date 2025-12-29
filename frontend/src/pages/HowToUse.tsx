import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Users, Building, Shield, GraduationCap, 
  CheckCircle, Play, BookOpen, 
  BarChart3, FileText, MapPin, Droplets 
} from 'lucide-react';
import Timeline from '@/components/Timeline';

const HowToUse = () => {
  const [activeRole, setActiveRole] = useState('citizen');

  const roleGuides = {
    citizen: {
      icon: <User className="h-6 w-6" />,
      title: 'Citizens & Individuals',
      description: 'Every individual can make a difference in water conservation',
      color: 'text-ocean-primary',
      steps: [
        {
          step: 1,
          title: 'Create Your Account',
          description: 'Sign up as a Citizen and complete your profile',
          actions: ['Choose "Citizen" role during signup', 'Verify your email address', 'Complete profile information'],
          icon: <User className="h-5 w-5" />
        },
        {
          step: 2,
          title: 'Report Pollution',
          description: 'Identify and report water pollution in your area',
          actions: ['Take photos of pollution incidents', 'Provide detailed location information', 'Submit reports through our platform'],
          icon: <FileText className="h-5 w-5" />
        },
        {
          step: 3,
          title: 'Monitor Dashboard',
          description: 'Track water quality in your region',
          actions: ['View real-time water quality data', 'Check pollution hotspot maps', 'Monitor improvement trends'],
          icon: <BarChart3 className="h-5 w-5" />
        },
        {
          step: 4,
          title: 'Adopt Water Bodies',
          description: 'Participate in NFT-based water body adoption',
          actions: ['Browse available water bodies', 'Make adoption pledge', 'Track ecosystem recovery'],
          icon: <Droplets className="h-5 w-5" />
        }
      ]
    },
    student: {
      icon: <GraduationCap className="h-6 w-6" />,
      title: 'Students & Researchers',
      description: 'Learn and contribute to water conservation research',
      color: 'text-success',
      steps: [
        {
          step: 1,
          title: 'Access Learning Resources',
          description: 'Explore educational content and research data',
          actions: ['Access water quality datasets', 'Download research reports', 'Join student communities'],
          icon: <BookOpen className="h-5 w-5" />
        },
        {
          step: 2,
          title: 'Conduct Research Projects',
          description: 'Use platform data for academic research',
          actions: ['Analyze water quality trends', 'Study pollution patterns', 'Publish findings'],
          icon: <BarChart3 className="h-5 w-5" />
        },
        {
          step: 3,
          title: 'Participate in Citizen Science',
          description: 'Contribute to data collection efforts',
          actions: ['Submit field observations', 'Validate pollution reports', 'Support data verification'],
          icon: <CheckCircle className="h-5 w-5" />
        },
        {
          step: 4,
          title: 'Share Knowledge',
          description: 'Educate others about water conservation',
          actions: ['Create awareness campaigns', 'Organize cleanup drives', 'Mentor other students'],
          icon: <Users className="h-5 w-5" />
        }
      ]
    },
    ngo: {
      icon: <Users className="h-6 w-6" />,
      title: 'NGOs & Organizations',
      description: 'Leverage data and tools for large-scale conservation',
      color: 'text-accent',
      steps: [
        {
          step: 1,
          title: 'Advanced Analytics Access',
          description: 'Get comprehensive data insights and predictions',
          actions: ['Access pollution prediction models', 'Download detailed analytics reports', 'Use API for data integration'],
          icon: <BarChart3 className="h-5 w-5" />
        },
        {
          step: 2,
          title: 'Coordinate Campaigns',
          description: 'Organize large-scale conservation efforts',
          actions: ['Plan cleanup initiatives', 'Mobilize volunteer networks', 'Track campaign effectiveness'],
          icon: <Users className="h-5 w-5" />
        },
        {
          step: 3,
          title: 'Partner with Communities',
          description: 'Build local partnerships for sustainable impact',
          actions: ['Connect with local groups', 'Provide training resources', 'Share best practices'],
          icon: <Shield className="h-5 w-5" />
        },
        {
          step: 4,
          title: 'Report Impact',
          description: 'Document and share conservation achievements',
          actions: ['Generate impact reports', 'Showcase success stories', 'Apply for funding'],
          icon: <FileText className="h-5 w-5" />
        }
      ]
    },
    government: {
      icon: <Building className="h-6 w-6" />,
      title: 'Government & Policy Makers',
      description: 'Use data-driven insights for policy development',
      color: 'text-warning',
      steps: [
        {
          step: 1,
          title: 'Policy Dashboard',
          description: 'Access comprehensive regional water quality data',
          actions: ['Monitor compliance metrics', 'Track pollution sources', 'Assess intervention effectiveness'],
          icon: <BarChart3 className="h-5 w-5" />
        },
        {
          step: 2,
          title: 'Regulatory Enforcement',
          description: 'Use real-time data for enforcement actions',
          actions: ['Identify violation hotspots', 'Prioritize inspection areas', 'Track improvement trends'],
          icon: <Shield className="h-5 w-5" />
        },
        {
          step: 3,
          title: 'Public Engagement',
          description: 'Engage citizens in environmental protection',
          actions: ['Share transparency reports', 'Promote citizen reporting', 'Recognize community efforts'],
          icon: <Users className="h-5 w-5" />
        },
        {
          step: 4,
          title: 'Strategic Planning',
          description: 'Develop evidence-based conservation strategies',
          actions: ['Use AI predictions for planning', 'Allocate resources effectively', 'Set measurable targets'],
          icon: <MapPin className="h-5 w-5" />
        }
      ]
    }
  };

  const currentGuide = roleGuides[activeRole as keyof typeof roleGuides];

  const quickActions = [
    { title: 'Report Pollution Now', description: 'Found water pollution? Report it immediately', link: '/report', icon: <FileText className="h-4 w-4" /> },
    { title: 'Check Water Quality', description: 'View real-time water quality data', link: '/dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { title: 'Adopt Water Body', description: 'Participate in NFT water body adoption', link: '/nft-adoption', icon: <Droplets className="h-4 w-4" /> },
    { title: 'View Success Stories', description: 'See conservation success stories', link: '/success-stories', icon: <CheckCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">How to Use Aqua Guardian</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Step-by-step guides tailored for different user roles to maximize your impact on water conservation
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-ocean-primary" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>Get started immediately with these common actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="ocean-card hover:scale-105 transition-transform cursor-pointer">
                <CardContent className="p-4 text-center space-y-3">
                  <div className="w-10 h-10 mx-auto bg-ocean-primary/10 rounded-full flex items-center justify-center text-ocean-primary">
                    {action.icon}
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Guides */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle>Role-Based User Guides</CardTitle>
          <CardDescription>Choose your role to see customized instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeRole} onValueChange={setActiveRole}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="citizen" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Citizens</span>
              </TabsTrigger>
              <TabsTrigger value="student" className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Students</span>
              </TabsTrigger>
              <TabsTrigger value="ngo" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">NGOs</span>
              </TabsTrigger>
              <TabsTrigger value="government" className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Government</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeRole} className="space-y-6">
              {/* Role Header */}
              <div className="text-center space-y-4">
                <div className={`w-16 h-16 mx-auto bg-card rounded-full flex items-center justify-center ${currentGuide.color}`}>
                  {currentGuide.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{currentGuide.title}</h2>
                  <p className="text-muted-foreground">{currentGuide.description}</p>
                </div>
              </div>

              {/* Steps */}
              <Timeline
                items={currentGuide.steps.map((step) => ({
                  step: step.step,
                  title: step.title,
                  description: step.description,
                  icon: step.icon,
                  actions: step.actions,
                }))}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Getting Started CTA */}
      <Card className="ocean-card text-center">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join the Aqua Guardian community and start making a difference in water conservation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="wave-animation">
              <User className="h-4 w-4 mr-2" />
              Create Account
            </Button>
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Get support and additional resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto bg-ocean-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-ocean-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Documentation</h3>
              <p className="text-sm text-muted-foreground">Comprehensive guides and API docs</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Community</h3>
              <p className="text-sm text-muted-foreground">Connect with other water guardians</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Support</h3>
              <p className="text-sm text-muted-foreground">Get help from our team</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HowToUse;