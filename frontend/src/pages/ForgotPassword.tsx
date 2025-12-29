import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Droplets, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast({
                title: "Missing Email",
                description: "Please enter your email address",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Send password reset email using Supabase
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                console.error('Password reset error:', error);
                toast({
                    title: "Error",
                    description: error.message || "Failed to send reset link. Please try again.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Reset Link Sent",
                    description: "If an account exists with this email, you will receive a password reset link.",
                });
                setEmail(''); // Clear the email field
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
                            <CardTitle className="text-2xl font-bold text-foreground">Reset Password</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Enter your email to receive a password reset link
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
                            </div>

                            <Button
                                type="submit"
                                className="w-full wave-animation"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    "Sending Link..."
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-ocean-primary hover:text-ocean-light transition-colors text-sm font-medium"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
