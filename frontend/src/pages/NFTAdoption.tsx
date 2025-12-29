import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Heart, MapPin, Droplets, Fish, Star, Shield,
  Users, TrendingUp, CheckCircle, ExternalLink
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = "http://127.0.0.1:8000";

interface WaterBodyNFT {
  id: string;
  name: string;
  location_name: string;
  type: string;
  adoption_price: number;
  health_score: number;
  description: string;
  image_url: string;
  adopted?: boolean;
  adoptedBy?: string;
  impact?: {
    reports: number;
    cleanups: number;
    guardians: number;
  };
}

const NFTAdoption = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [waterBodies, setWaterBodies] = useState<WaterBodyNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForAdoption, setSelectedForAdoption] = useState<WaterBodyNFT | null>(null);
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [pledgeText, setPledgeText] = useState("I pledge to protect the purity of this water and report any pollution I see. This is my permanent commitment as a Guardian.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mintedNFT, setMintedNFT] = useState<any>(null);

  useEffect(() => {
    fetchWaterBodies();
  }, []);

  const fetchWaterBodies = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/adoption/water-bodies`);
      // Fetch impact for each
      const bodiesWithStats = await Promise.all(response.data.map(async (body: any) => {
        try {
          const statsRes = await axios.get(`${API_BASE_URL}/adoption/status/${body.id}`);
          return {
            ...body,
            impact: {
              reports: statsRes.data.reports_count,
              cleanups: statsRes.data.cleanups_count,
              guardians: statsRes.data.active_guardians.length
            },
            adopted: statsRes.data.active_guardians.length > 0,
            adoptedBy: statsRes.data.active_guardians[0]?.users?.name || "Multiple Guardians"
          };
        } catch (e) {
          return { ...body, adopted: false };
        }
      }));
      setWaterBodies(bodiesWithStats);
    } catch (error) {
      console.error("Error fetching water bodies:", error);
      toast({
        title: "Error",
        description: "Failed to load water bodies.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptClick = (waterBody: WaterBodyNFT) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to adopt a water body",
        variant: "destructive",
      });
      return;
    }
    setSelectedForAdoption(waterBody);
    setIsAdoptModalOpen(true);
  };

  const handleConfirmAdoption = async () => {
    if (!user || !selectedForAdoption || !pledgeText.trim()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("water_body_id", selectedForAdoption.id);
      formData.append("pledge_text", pledgeText);

      const response = await axios.post(`${API_BASE_URL}/adoption/adopt`, formData);

      setMintedNFT(response.data[0]);
      setIsAdoptModalOpen(false);
      setIsCertModalOpen(true);
      fetchWaterBodies(); // Refresh

      toast({
        title: "Adoption Successful! 🎉",
        description: `You've successfully adopted ${selectedForAdoption.name}. Your NFT is being generated.`,
      });
    } catch (error: any) {
      toast({
        title: "Adoption Failed",
        description: error.response?.data?.detail || "An error occurred during adoption.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-ocean-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const totalAdoptions = waterBodies.filter(wb => wb.adopted).length;
  const totalAvailable = waterBodies.length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">NFT Water Body Adoption</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Adopt and protect water ecosystems through blockchain-powered conservation.
          Your adoption helps fund monitoring, cleanup, and restoration efforts.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-8 max-w-2xl mx-auto">
          <div className="text-center p-4 bg-ocean-primary/5 rounded-2xl sm:bg-transparent sm:p-0">
            <div className="text-3xl font-bold text-ocean-primary">{totalAdoptions}</div>
            <div className="text-sm text-muted-foreground">Adopted</div>
          </div>
          <div className="text-center p-4 bg-success/5 rounded-2xl sm:bg-transparent sm:p-0">
            <div className="text-3xl font-bold text-success">{totalAvailable - totalAdoptions}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
          <div className="text-center p-4 bg-accent/5 rounded-2xl sm:bg-transparent sm:p-0 col-span-2 md:col-span-1">
            <div className="text-3xl font-bold text-accent">15,000+</div>
            <div className="text-sm text-muted-foreground">Monitoring Logs</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-ocean-primary" />
            <span>How NFT Adoption Works</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-ocean-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-ocean-primary">1</span>
              </div>
              <h3 className="font-semibold text-foreground">Choose Water Body</h3>
              <p className="text-sm text-muted-foreground">Select a water ecosystem that needs protection</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-ocean-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-ocean-primary">2</span>
              </div>
              <h3 className="font-semibold text-foreground">Make Pledge</h3>
              <p className="text-sm text-muted-foreground">Commit to protecting and monitoring the ecosystem</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-ocean-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-ocean-primary">3</span>
              </div>
              <h3 className="font-semibold text-foreground">Get NFT Certificate</h3>
              <p className="text-sm text-muted-foreground">Receive blockchain-verified adoption certificate</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-ocean-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-ocean-primary">4</span>
              </div>
              <h3 className="font-semibold text-foreground">Track Impact</h3>
              <p className="text-sm text-muted-foreground">Monitor ecosystem health and conservation progress</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Water Bodies */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => <Card key={i} className="h-96 animate-pulse bg-muted/50 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {waterBodies.map((waterBody) => (
            <Card key={waterBody.id} className={`ocean-card relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-ocean-primary/20 ${waterBody.adopted ? 'border-success/30' : ''}`}>
              {waterBody.adopted && (
                <div className="absolute top-4 right-4 z-10 animate-fade-in">
                  <Badge className="bg-success text-success-foreground border-none">
                    <Heart className="h-3 w-3 mr-1 fill-current" />
                    Adopted
                  </Badge>
                </div>
              )}

              <div className="relative h-48 overflow-hidden">
                <img
                  src={waterBody.image_url}
                  alt={waterBody.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-foreground mb-1">{waterBody.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-ocean-primary" />
                    <span>{waterBody.location_name}</span>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest border-ocean-primary/30 text-ocean-primary">
                      {waterBody.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Current Health</p>
                    <div className="flex items-center space-x-3">
                      <Progress value={waterBody.health_score} className="w-full sm:w-24 h-2" />
                      <span className={`text-lg font-black ${getHealthColor(waterBody.health_score)}`}>
                        {waterBody.health_score}%
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Commitment</p>
                    <p className="text-2xl font-black text-ocean-primary">{waterBody.adoption_price} <span className="text-xs font-normal">ETH</span></p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-success" />
                      Live Impact Data
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-ocean-primary/5 rounded-2xl border border-ocean-primary/10">
                      <div className="text-lg sm:text-xl font-black text-foreground">{waterBody.impact?.reports || 0}</div>
                      <div className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Reports</div>
                    </div>
                    <div className="text-center p-3 bg-ocean-primary/5 rounded-2xl border border-ocean-primary/10">
                      <div className="text-lg sm:text-xl font-black text-ocean-primary">{waterBody.impact?.cleanups || 0}</div>
                      <div className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Cleanups</div>
                    </div>
                    <div className="text-center p-3 bg-ocean-primary/5 rounded-2xl border border-ocean-primary/10 col-span-2 sm:col-span-1">
                      <div className="text-lg sm:text-xl font-black text-success">{waterBody.impact?.guardians || 0}</div>
                      <div className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Guardians</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  {waterBody.adopted ? (
                    <div className="w-full flex items-center justify-between bg-success/5 p-3 rounded-xl border border-success/10">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase font-black mb-1">Primary Guardian</p>
                        <span className="text-sm font-bold flex items-center gap-2 text-success">
                          <CheckCircle className="h-4 w-4" />
                          {waterBody.adoptedBy}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-ocean-primary hover:text-ocean-primary" asChild>
                        <a href="/report" className="flex items-center gap-1 font-bold">
                          Monitor <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleAdoptClick(waterBody)}
                      className="w-full wave-animation h-12 text-md font-bold"
                      disabled={!user}
                    >
                      <Droplets className="h-5 w-5 mr-2" />
                      Adopt & Make Pledge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Adoption Modals */}
      <Dialog open={isAdoptModalOpen} onOpenChange={setIsAdoptModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Shield className="h-6 w-6 text-ocean-primary" />
              Conservation Pledge
            </DialogTitle>
            <DialogDescription className="text-sm">
              Adopting <strong className="text-foreground">"{selectedForAdoption?.name}"</strong> is a solemn commitment to monitoring and protecting this ecosystem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label htmlFor="pledge" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Your Public Commitment</Label>
              <Textarea
                id="pledge"
                placeholder="I pledge to monitor Chilika Lake and report any illegal poaching or industrial runoff I observe..."
                value={pledgeText}
                onChange={(e) => setPledgeText(e.target.value)}
                className="min-h-[120px] bg-muted/30 border-ocean-primary/20 focus:border-ocean-primary"
              />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                By clicking below, you agree to have this pledge permanently etched into the NFT certificate metadata on the blockchain. This remains a public record of your responsibility.
              </p>
            </div>
            <div className="p-4 bg-ocean-primary/10 rounded-2xl border border-ocean-primary/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs uppercase font-black text-muted-foreground">Adoption Price</span>
                <span className="text-xl font-black text-ocean-primary">{selectedForAdoption?.adoption_price} ETH</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                * Simulated transaction for Aqua Guardian Prototypes.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdoptModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmAdoption} disabled={isSubmitting || !pledgeText.trim()} className="wave-animation px-8">
              {isSubmitting ? "Minting NFT..." : "Adhere to Pledge & Adopt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCertModalOpen} onOpenChange={setIsCertModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl bg-gradient-to-b from-ocean-primary/20 to-background border-ocean-primary/30 rounded-3xl overflow-hidden p-0 max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-8">
            <DialogHeader className="text-center mb-4 sm:mb-8">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-success/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 border-4 border-success/10">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-success" />
              </div>
              <DialogTitle className="text-2xl sm:text-4xl font-serif text-foreground">NFT Adoption Certificate</DialogTitle>
              <DialogDescription className="text-ocean-primary font-black tracking-[0.2em] uppercase text-[8px] sm:text-[10px] flex items-center justify-center gap-2 mt-2">
                <Shield className="h-3 w-3" />
                TX: {mintedNFT?.blockchain_tx?.substring(0, 10)}...
              </DialogDescription>
            </DialogHeader>

            <div className="relative border-4 sm:border-8 border-double border-ocean-primary/30 p-4 sm:p-10 text-center bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
              <Droplets className="absolute -top-10 -left-10 h-32 w-32 text-ocean-primary/5 rotate-12" />
              <Fish className="absolute -bottom-10 -right-10 h-32 w-32 text-success/5 -rotate-12" />

              <p className="text-xs sm:text-sm italic font-serif text-muted-foreground mb-4">This document certifies that</p>
              <h2 className="text-xl sm:text-3xl font-black text-foreground underline decoration-ocean-primary/20 underline-offset-8 mb-4 sm:mb-6">{user?.name}</h2>
              <p className="text-xs sm:text-sm italic font-serif text-muted-foreground mb-4">has officially adopted</p>
              <h3 className="text-lg sm:text-2xl font-black text-ocean-primary mb-6 sm:mb-10 tracking-tight">
                {selectedForAdoption?.name}
              </h3>

              <div className="bg-ocean-primary/5 p-4 sm:p-6 rounded-2xl border border-ocean-primary/10 mb-6 sm:mb-10 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-[9px] font-black uppercase text-ocean-primary border border-ocean-primary/20 rounded-full">
                  The Sacred Pledge
                </div>
                <p className="text-sm sm:text-md italic text-foreground leading-relaxed font-serif">"{pledgeText}"</p>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-left space-y-1">
                  <div className="text-[10px] font-black text-muted-foreground uppercase flex gap-2">
                    <span>TOKEN ID:</span>
                    <span className="text-foreground">#{mintedNFT?.nft_token_id}</span>
                  </div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase flex gap-2">
                    <span>STATUS:</span>
                    <span className="text-success uppercase tracking-widest">PERMANENT</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Authenticated</p>
                  <p className="text-[10px] font-black text-ocean-primary tracking-widest">AQUA GUARDIAN PROTOCOL</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-background border-t border-border flex justify-center">
            <Button className="w-full h-12 font-black uppercase tracking-widest" onClick={() => setIsCertModalOpen(false)}>
              Proceed to Guardian Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adoption Benefits Info */}
      <Card className="ocean-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/20 rounded-lg">
              <Star className="h-6 w-6 text-warning fill-current" />
            </div>
            <div>
              <CardTitle>Guardian Privileges</CardTitle>
              <CardDescription>Benefits and responsibilities of water body adoption</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 bg-ocean-primary/10 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-ocean-primary/20">
                <Shield className="h-6 w-6 text-ocean-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">NFT Provenance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Permanent blockchain record of your adoption and personal pledge.
                </p>
              </div>
            </div>

            <div className="flex gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-success/20">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">Direct Oversight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Linked pollution reports show up directly on your guardian dashboard.
                </p>
              </div>
            </div>

            <div className="flex gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-accent/20">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">Community Leader</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Earn the "Guardian" elite badge and rank higher on leaderboard.
                </p>
              </div>
            </div>

            <div className="flex gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-warning/20">
                <Star className="h-6 w-6 text-warning" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">Exclusive Reporting</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Admins prioritize reports coming from verified site guardians.
                </p>
              </div>
            </div>

            <div className="flex gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 bg-ocean-light/10 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-ocean-light/20">
                <Fish className="h-6 w-6 text-ocean-light" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">Ecological Data</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Access deep-dive biodiversity reports for your adopted water body.
                </p>
              </div>
            </div>

            <div className="flex gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-destructive/20">
                <Heart className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">Action Transparency</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Real-time GPS tracking of cleanup crews in your sector.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTAdoption;