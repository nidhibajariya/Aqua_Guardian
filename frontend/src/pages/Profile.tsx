import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Award, TrendingUp, Droplets, MapPin, FileText, Edit } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [reportCount, setReportCount] = React.useState<number>(user?.reportsSubmitted || 0);

  React.useEffect(() => {
    const fetchReportCount = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/reports/count/${user.id}`);
        const data = await response.json();
        setReportCount(data.count);
      } catch (error) {
        console.error("Error fetching report count:", error);
      }
    };

    fetchReportCount();
  }, [user?.id]);

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  const achievements = [
    { icon: <FileText className="h-5 w-5" />, title: 'Reports Filed', count: reportCount, target: 20 },
    { icon: <Droplets className="h-5 w-5" />, title: 'Clean-ups Joined', count: user.cleanUpsJoined, target: 10 },
    { icon: <MapPin className="h-5 w-5" />, title: 'NFTs Adopted', count: user.nftsAdopted, target: 5 },
  ];

  const badges = [
    { name: 'Water Guardian', level: 'Bronze', description: 'First pollution report submitted' },
    { name: 'Eco Warrior', level: 'Silver', description: 'Participated in 3+ cleanup activities' },
    { name: 'Ocean Protector', level: 'Gold', description: 'Adopted 2+ water bodies' },
  ];

  const impactStats = [
    { label: 'Pollution Reports', value: reportCount, color: 'text-ocean-primary' },
    { label: 'Lives Protected', value: Math.floor(reportCount * 150), color: 'text-success' },
    { label: 'Water Cleaned (L)', value: Math.floor(user.cleanUpsJoined * 5000), color: 'text-accent' },
    { label: 'Marine Lives Saved', value: Math.floor(user.nftsAdopted * 200), color: 'text-ocean-light' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
        <p className="text-muted-foreground">
          Manage your account and track your environmental impact
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <Card className="ocean-card lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-ocean-primary to-ocean-light rounded-full flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl text-foreground">{user.name}</CardTitle>
            <CardDescription className="flex items-center justify-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <Badge className="wave-animation">
                <Shield className="h-3 w-3 mr-1" />
                {user.role}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-medium text-foreground">January 2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Guardian Level</span>
                <Badge className="bg-success text-success-foreground">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Location</span>
                <span className="text-sm font-medium text-foreground">India</span>
              </div>
            </div>

            <Button className="w-full wave-animation">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Impact & Achievements */}
        <div className="lg:col-span-2 space-y-8">
          {/* Impact Statistics */}
          <Card className="ocean-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-ocean-primary" />
                <span>Environmental Impact</span>
              </CardTitle>
              <CardDescription>Your contribution to water conservation efforts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {impactStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracking */}
          <Card className="ocean-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-warning" />
                <span>Progress Tracking</span>
              </CardTitle>
              <CardDescription>Your journey towards environmental milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {achievements.map((achievement, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-ocean-primary">{achievement.icon}</div>
                        <span className="font-medium text-foreground">{achievement.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {achievement.count} / {achievement.target}
                      </span>
                    </div>
                    <Progress
                      value={(achievement.count / achievement.target) * 100}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {achievement.target - achievement.count > 0
                        ? `${achievement.target - achievement.count} more to reach target`
                        : 'Target achieved! 🎉'
                      }
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Badges & Achievements */}
          <Card className="ocean-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-warning" />
                <span>Badges & Recognition</span>
              </CardTitle>
              <CardDescription>Awards earned for environmental contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {badges.map((badge, index) => (
                  <div key={index} className="text-center p-4 bg-card/50 rounded-lg border border-border">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-warning to-accent rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-warning-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{badge.name}</h3>
                    <Badge
                      className={
                        badge.level === 'Bronze' ? 'bg-amber-600 text-white' :
                          badge.level === 'Silver' ? 'bg-gray-400 text-white' :
                            'bg-yellow-500 text-white'
                      }
                    >
                      {badge.level}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">{badge.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest contributions to water conservation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-card/50 rounded-lg">
              <div className="w-8 h-8 bg-ocean-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-ocean-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Submitted pollution report</p>
                <p className="text-xs text-muted-foreground">Mumbai Harbor - Industrial discharge • 2 days ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-card/50 rounded-lg">
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                <Droplets className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Joined beach cleanup</p>
                <p className="text-xs text-muted-foreground">Collected 50kg plastic waste • 5 days ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-card/50 rounded-lg">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Adopted water body NFT</p>
                <p className="text-xs text-muted-foreground">Chilika Lake protection pledge • 1 week ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;