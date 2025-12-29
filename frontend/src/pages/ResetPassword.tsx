import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Droplets, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have a valid session (user clicked reset link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                toast({
                    title: "Invalid Reset Link",
                    description: "This password reset link is invalid or has expired.",
                    variant: "destructive",
                });
                navigate('/login');
            }
        });
    }, [navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Weak Password",
                description: "Password must be at least 6 characters long",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Update the user's password
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                console.error('Password update error:', error);
                toast({
                    title: "Update Failed",
                    description: error.message || "Failed to update password. Please try again.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Password Updated",
                    description: "Your password has been successfully updated. Please login with your new password.",
                });

                // Sign out the user so they can login with new password
                await supabase.auth.signOut();

                // Redirect to login after a short delay
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error: any) {
            console.error('Unexpected error:', error);
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
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
                            <CardTitle className="text-2xl font-bold text-foreground">Set New Password</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Enter your new password below
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="password" className="text-foreground">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                                    <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            </div>

                            <Button
                                type="submit"
                                className="w-full wave-animation"
                                disabled={isLoading}
                            >
                                {isLoading ? "Updating Password..." : "Update Password"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="text-muted-foreground hover:text-ocean-light transition-colors text-sm"
                            >
                                ← Back to Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
