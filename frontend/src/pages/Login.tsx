import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Droplets, LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('Citizen');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    try {
      const result = await login(email, password, role);

      if (result.success) {
        toast({
          title: "Welcome back!",
          description: `Successfully logged in as ${role}`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="ocean-card">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-ocean-primary/10 rounded-full flex items-center justify-center">
              <Droplets className="h-8 w-8 text-ocean-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your Aqua Guardian account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 bg-background border-border focus:border-ocean-primary"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-ocean-primary hover:text-ocean-light transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background border-border focus:border-ocean-primary pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role" className="text-foreground">Role</Label>
                  <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                    <SelectTrigger className="mt-1 bg-background border-border focus:border-ocean-primary">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="ocean-card border-border">
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Citizen">Citizen</SelectItem>
                      <SelectItem value="NGO">NGO</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full wave-animation"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-ocean-primary hover:text-ocean-light transition-colors font-medium"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/"
                className="text-muted-foreground hover:text-ocean-light transition-colors text-sm"
              >
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;