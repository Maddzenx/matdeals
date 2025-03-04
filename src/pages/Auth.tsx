
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useNavigationState } from "@/hooks/useNavigationState";
import { User } from "@supabase/supabase-js";
import { UserProfile } from '@/components/UserProfile';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { navItems } = useNavigationState();

  useEffect(() => {
    // Check if user is already logged in
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        // Show success message for registration
        setError('Registration successful! Please check your email to confirm your account.');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavSelect = (id: string) => {
    if (id === "offers") {
      navigate("/");
    } else if (id === "cart") {
      navigate("/shopping-list");
    } else {
      console.log("Selected nav:", id);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white pb-28 pt-6">
      <div className="max-w-md mx-auto px-4">
        {user ? (
          <UserProfile />
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#1C1C1C] mb-8 text-center">
              {mode === 'login' ? 'Logga in' : 'Skapa konto'}
            </h1>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-post
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Din e-postadress"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Lösenord
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ditt lösenord"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white font-medium py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                {loading ? 'Laddar...' : mode === 'login' ? 'Logga in' : 'Skapa konto'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                {mode === 'login' ? 'Skapa nytt konto istället' : 'Logga in istället'}
              </button>
            </div>
          </>
        )}
      </div>
      
      <BottomNav items={navItems.map(item => 
        item.id === 'profile' ? {...item, active: true} : {...item, active: false}
      )} onSelect={handleNavSelect} />
    </div>
  );
};

export default Auth;
