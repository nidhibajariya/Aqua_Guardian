import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';


export type UserRole = 'Student' | 'Citizen' | 'NGO' | 'Government' | 'Other';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  reportsSubmitted: number;
  cleanUpsJoined: number;
  nftsAdopted: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('aqua-guardian-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // SIMULATION: Auto-populate demo user if no one is logged in
      console.log('🤖 Simulation: Auto-populating demo user');
      const demoUser: User = {
        id: '2f3516b6-f9a9-4e2e-9529-0ecd2c9cf395',
        email: 'demo@aquaguardian.com',
        name: 'Demo User',
        role: 'Citizen',
        reportsSubmitted: 0,
        cleanUpsJoined: 0,
        nftsAdopted: 0,
      };
      setUser(demoUser);
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('🔑 Direct Supabase login attempt:', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase login error:', error.message);
        return { success: false, message: error.message };
      }

      if (data?.user) {
        const newUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || email.split('@')[0],
          role: role,
          reportsSubmitted: 0,
          cleanUpsJoined: 0,
          nftsAdopted: 0,
        };

        console.log('✅ Login successful:', { userId: newUser.id });
        setUser(newUser);
        localStorage.setItem('aqua-guardian-user', JSON.stringify(newUser));
        return { success: true };
      }
      return { success: false, message: "Login failed. No user data returned." };
    } catch (error: any) {
      console.error("Login failed:", error);
      return { success: false, message: error.message || "An unexpected error occurred during login." };
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('🔐 Direct Supabase signup attempt:', { email, name, role });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role,
          }
        }
      });

      if (error) {
        console.error('❌ Supabase signup error:', error.message);
        return {
          success: false,
          message: error.message || 'Registration failed. Please try again.'
        };
      }

      if (data?.user) {
        // Create the public profile entry to satisfy foreign key constraints
        console.log('👤 Creating public profile for user:', data.user.id);
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email || email,
              full_name: name,
              role: role.toLowerCase(),
            }
          ]);

        if (profileError) {
          console.error('❌ Failed to create public profile:', profileError);
          // We don't necessarily want to fail the whole signup if profile creation fails,
          // but for this app, reporting depends on it, so it's critical.
          return {
            success: false,
            message: "Account created but profile setup failed. " + profileError.message
          };
        }

        const newUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: name,
          role: role,
          reportsSubmitted: 0,
          cleanUpsJoined: 0,
          nftsAdopted: 0,
        };

        console.log('✅ Signup and profile creation successful:', { userId: newUser.id, email: newUser.email });

        setUser(newUser);
        localStorage.setItem('aqua-guardian-user', JSON.stringify(newUser));
        return { success: true };
      }

      console.warn('⚠️ No user data in response');
      return { success: false, message: "Registration failed. Please try again." };
    } catch (error: any) {
      console.error('❌ Signup failed:', {
        email,
        error: error.message,
        fullError: error
      });

      return {
        success: false,
        message: error.message || 'An unexpected error occurred during signup.'
      };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('aqua-guardian-user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};