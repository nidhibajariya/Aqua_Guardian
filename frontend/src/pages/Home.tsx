import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, BarChart3, MapPin, Users, Droplets, Fish, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import heroImage from '@/assets/hero-ocean.jpg';
import beforeAfterImage from '@/assets/before-after-story.jpg';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-ocean-primary" />,
      title: "Real-time Monitoring",
      description: "Track water quality parameters with live data and AI-powered insights"
    },
    {
      icon: <MapPin className="h-8 w-8 text-accent" />,
      title: "Pollution Reporting",
      description: "Report pollution incidents with location tracking and photo evidence"
    },
    {
      icon: <Shield className="h-8 w-8 text-success" />,
      title: "NFT Water Adoption",
      description: "Adopt and protect water bodies through blockchain-based ownership"
    },
    {
      icon: <Fish className="h-8 w-8 text-ocean-light" />,
      title: "Marine Impact Analysis",
      description: "AI predictions of pollution effects on marine life and ecosystems"
    }
  ];

  const stats = [
    { label: "Water Bodies Protected", value: "1,247", color: "text-success" },
    { label: "Pollution Reports Filed", value: "8,934", color: "text-ocean-primary" },
    { label: "Marine Lives Saved", value: "45,678", color: "text-accent" },
    { label: "Active Guardians", value: "12,456", color: "text-ocean-light" }
  ];

  const alertStatus = [
    { location: "Mumbai Harbor", status: "danger", value: "Critical", icon: <AlertTriangle className="h-4 w-4" /> },
    { location: "Ganges Delta", status: "warning", value: "Warning", icon: <Eye className="h-4 w-4" /> },
    { location: "Chilika Lake", status: "safe", value: "Safe", icon: <CheckCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
            filter: 'brightness(0.4)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

        <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="space-y-4">
              <Badge className="wave-animation text-sm md:text-lg px-4 md:px-6 py-1 md:py-2">
                <Droplets className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Protecting Water, Protecting Life
              </Badge>
              <h1 className="text-4xl md:text-8xl font-bold text-foreground leading-tight">
                Aqua
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-primary to-ocean-light">
                  Guardian
                </span>
              </h1>
              <p className="text-base md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
                Report pollution, join community cleanup drives, and track real-world impact using AI and blockchain. Protecting our planet's water is now verifiable and community-led.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto wave-animation text-lg px-8 py-6 md:py-4 ocean-glow">
                      View Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/report" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 md:py-4 border-ocean-primary text-ocean-light hover:bg-ocean-primary/10">
                      Report Pollution
                    </Button>
                  </Link>
                  <Link to="/community-action" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 md:py-4 border-accent text-accent hover:bg-accent/10">
                      Community Action
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto wave-animation text-lg px-8 py-6 md:py-4 ocean-glow">
                      Join as Guardian
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/community-action" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 md:py-4 border-accent text-accent hover:bg-accent/10">
                      Community Action
                    </Button>
                  </Link>
                  <Link to="/how-to-use" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 md:py-4 border-ocean-primary text-ocean-light hover:bg-ocean-primary/10">
                      Learn More
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-ocean-light/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </section>

      {/* Real-time Alerts */}
      <section className="py-16 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Live Water Quality Alerts</h2>
            <p className="text-muted-foreground">Real-time monitoring across protected water bodies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {alertStatus.map((alert, index) => (
              <Card key={index} className="ocean-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{alert.location}</h3>
                    {alert.icon}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={alert.status === 'danger' ? 'destructive' : alert.status === 'warning' ? 'secondary' : 'default'}
                      className={
                        alert.status === 'safe' ? 'bg-success text-success-foreground' :
                          alert.status === 'warning' ? 'bg-warning text-warning-foreground' : ''
                      }
                    >
                      {alert.value}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Last updated: 2 min ago</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features for Water Protection</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools to monitor, report, and protect our water ecosystems
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="ocean-card text-center group hover:scale-105 transition-transform duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-3 bg-card rounded-full w-fit group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Success Story Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Transformation Stories</h2>
            <p className="text-xl text-muted-foreground">Witness the positive impact of our conservation efforts</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="ocean-card overflow-hidden">
              <div className="relative">
                <img
                  src={beforeAfterImage}
                  alt="Before and after water restoration"
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Lake Restoration Success</h3>
                  <p className="text-muted-foreground mb-4">From polluted waters to thriving ecosystem in 18 months</p>
                  <Link to="/success-stories">
                    <Button className="wave-animation">
                      View All Stories
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ocean-deep via-card to-ocean-deep">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold text-foreground">Ready to Make a Difference?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of water guardians monitoring and protecting our planet's water resources
            </p>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="wave-animation text-lg px-8 py-4 ocean-glow">
                    <Users className="mr-2 h-5 w-5" />
                    Become a Guardian
                  </Button>
                </Link>
                <Link to="/community-action">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-accent text-accent hover:bg-accent/10">
                    Join Cleanup Drive
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;