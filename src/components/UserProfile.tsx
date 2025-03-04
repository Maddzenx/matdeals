
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Laddar...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg mt-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">Din profil</h2>
        <p className="text-gray-600">{user.email}</p>
      </div>
      
      <button
        onClick={handleSignOut}
        className="w-full bg-red-500 text-white font-medium py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
      >
        Logga ut
      </button>
    </div>
  );
};
