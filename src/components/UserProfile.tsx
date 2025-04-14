import React from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileProps {
  // Add any specific props if needed
}

export function UserProfile({}: UserProfileProps) {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');

  React.useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { user } = session;
          setSession(session);
          setEmail(user?.email || '');
        }
      } catch (error) {
        console.error('Error loading user data!', error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        setSession(session);
        if (session?.user) {
          setEmail(session.user.email || '');
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
        {loading ? (
          <p>Loading user data...</p>
        ) : session ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="email"
                placeholder="Email"
                value={email}
                readOnly
              />
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </>
        ) : (
          <p>Not signed in</p>
        )}
      </div>
    </div>
  );
}
