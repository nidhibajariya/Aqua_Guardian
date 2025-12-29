import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, CheckCircle, Clock, ArrowRight, ShieldCheck, UserCircle } from 'lucide-react';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL = "http://127.0.0.1:8000";

interface CleanupAction {
    id: string;
    report_id: string;
    status: string;
    progress: number;
    participants_count: number;
    organization?: string;
    completion_remark?: string;
    reports?: {
        latitude: number;
        longitude: number;
        description: string;
        ai_class: string;
    };
}

const CommunityActivities = () => {
    const [activities, setActivities] = useState<CleanupAction[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/cleanup/active`);
            setActivities(response.data);
        } catch (error) {
            console.error("Error fetching activities:", error);
            toast({
                title: "Error",
                description: "Failed to load community activities.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4 bg-ocean-primary/10 text-ocean-primary border-ocean-primary/20">
                    Public Transparency Board
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Real-World Environmental Action</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Track active cleanup operations where municipalities, NGOs, and citizens unite to restore our waterways.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse bg-card/50 h-[300px]" />
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <Card className="bg-card/50 border-dashed border-2 py-20 text-center">
                    <CardContent>
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No active cleanup operations at the moment.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((action) => (
                        <Card key={action.id} className="overflow-hidden border-ocean-primary/10 hover:border-ocean-primary/30 transition-all duration-300 group">
                            <CardHeader className="pb-4 relative">
                                <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                                    {action.progress === 100 ? (
                                        <CheckCircle className="h-6 w-6 text-success" />
                                    ) : (
                                        <Clock className="h-6 w-6 text-ocean-primary animate-pulse" />
                                    )}
                                </div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-ocean-primary" />
                                    {action.reports?.ai_class || "Pollution Cleanup"}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {action.reports?.description || "Ongoing restoration project."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-muted-foreground">Overall Progress</span>
                                        <span className="text-ocean-primary">{action.progress}%</span>
                                    </div>
                                    <Progress value={action.progress} className="h-2" />
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                    <div className="flex -space-x-2">
                                        {[...Array(Math.min(action.participants_count, 3))].map((_, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-ocean-primary/10 border-2 border-background flex items-center justify-center">
                                                <UserCircle className="h-5 w-5 text-ocean-primary" />
                                            </div>
                                        ))}
                                        {action.participants_count > 3 && (
                                            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold">
                                                +{action.participants_count - 3}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Led By</p>
                                        <div className="flex items-center gap-1 text-sm font-semibold">
                                            <ShieldCheck className="h-3 w-3 text-success" />
                                            {action.organization || "Local Municipality"}
                                        </div>
                                    </div>
                                </div>

                                <Button variant="ghost" className="w-full text-ocean-primary hover:text-ocean-primary/80 group/btn" asChild>
                                    <a href={`/report?id=${action.report_id}`}>
                                        View Full Verification Proof
                                        <ArrowRight className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Accountability Section */}
            <div className="mt-20 bg-ocean-primary/5 rounded-3xl p-12 border border-ocean-primary/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6 italic">Accountability & Proof</h2>
                        <div className="space-y-4">
                            {[
                                { title: "Municipality Informed", desc: "Every high-confidence report is automatically sent to local authorities." },
                                { title: "Direct Citizen Oversight", desc: "Publicly view photographs of the cleanup site before and after completion." },
                                { title: "Transparent Collaboration", desc: "See exactly which NGOs and volunteer groups are involved in each project." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success mt-1">
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-ocean-primary/20 via-transparent to-black/40 mix-blend-overlay" />
                            <img
                                src="https://images.unsplash.com/photo-1618477461853-cf6ed80fbe5e?auto=format&fit=crop&q=80&w=800"
                                alt="Cleanup Team"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Stats Overlay */}
                        <Card className="absolute -bottom-6 -left-6 bg-card/90 backdrop-blur shadow-xl border-ocean-primary/20 p-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-ocean-primary/10 rounded-xl">
                                    <Users className="h-6 w-6 text-ocean-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">1.2k+</p>
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Community Volunters</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityActivities;
