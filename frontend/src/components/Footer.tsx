import React from 'react';
import { Mail, Phone, Globe, Shield, Droplets } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="ocean-card border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-ocean-primary" />
              <span className="text-xl font-bold text-ocean-light">Aqua Guardian</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Protecting Water, Protecting Life. Join our mission to safeguard our planet's most precious resource.
            </p>
            <div className="flex space-x-3">
              <div className="w-10 h-10 bg-ocean-primary/20 rounded-full flex items-center justify-center">
                <Droplets className="h-5 w-5 text-ocean-primary" />
              </div>
              <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                <Globe className="h-5 w-5 text-accent" />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-ocean-light mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-ocean-primary" />
                <span>+91 9510972650</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-ocean-primary" />
                <span>urvashiparmar1603@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Globe className="h-4 w-4 text-ocean-primary" />
                <span>aquaguardian.org</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-border pt-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-ocean-primary" />
              <span className="text-ocean-light font-semibold text-lg">Aqua Guardian</span>
            </div>

            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Empowering communities to protect our planet's water resources through technology and collective action.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>© 2025 Aqua Guardian</span>
              <span className="hidden sm:inline">•</span>
              <span>All Rights Reserved</span>
              <span className="hidden sm:inline">•</span>
              <span>Made in India 🇮🇳</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground/80">
              <a href="#" className="hover:text-ocean-primary transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-ocean-primary transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-ocean-primary transition-colors">Contact Support</a>
            </div>
          </div>
        </div>

        {/* Water Wave Animation */}
        <div className="absolute inset-x-0 bottom-0 h-1 wave-animation opacity-60"></div>
      </div>
    </footer>
  );
};

export default Footer;