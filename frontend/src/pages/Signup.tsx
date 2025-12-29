import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Droplets, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Citizen' as UserRole,
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    try {
      const result = await signup(formData.email, formData.password, formData.name, formData.role);

      if (result.success) {
        toast({
          title: "Welcome to Aqua Guardian!",
          description: `Account created successfully as ${formData.role}`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Signup Failed",
          description: result.message || "Unable to create account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="ocean-card">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-ocean-primary/10 rounded-full flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-ocean-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Join Aqua Guardian</CardTitle>
              <CardDescription className="text-muted-foreground">
                Create your account and start protecting water resources
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 bg-background border-border focus:border-ocean-primary"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1 bg-background border-border focus:border-ocean-primary"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="mt-1 bg-background border-border focus:border-ocean-primary pr-10"
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
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="mt-1 bg-background border-border focus:border-ocean-primary pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role" className="text-foreground">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: UserRole) => handleInputChange('role', value)}
                  >
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                    className="border-border data-[state=checked]:bg-ocean-primary"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <Link to="#" className="text-ocean-primary hover:text-ocean-light">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="#" className="text-ocean-primary hover:text-ocean-light">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full wave-animation"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Creating Account..."
                ) : (
                  <>
                    <Droplets className="mr-2 h-4 w-4" />
                    Join as Guardian
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-ocean-primary hover:text-ocean-light transition-colors font-medium"
                >
                  Sign in here
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

export default Signup;