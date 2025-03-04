
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get the current user
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Utloggad",
        description: "Du har loggats ut från ditt konto",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte logga ut, försök igen senare",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Laddar...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg mt-4 mb-20">
      <div className="text-center mb-6">
        <div className="inline-block bg-green-100 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Din profil</h2>
        <p className="text-gray-600">{user.email}</p>
      </div>
      
      {user.user_metadata && (
        <div className="mb-6 border-t border-b border-gray-100 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">Användarnamn</span>
            <span className="font-medium">{user.user_metadata.name || 'Ej angivet'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Senast inloggad</span>
            <span className="font-medium">{new Date(user.last_sign_in_at || '').toLocaleDateString('sv-SE')}</span>
          </div>
        </div>
      )}
      
      <button
        onClick={handleSignOut}
        className="w-full bg-red-500 text-white font-medium py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
      >
        Logga ut
      </button>
    </div>
  );
};
