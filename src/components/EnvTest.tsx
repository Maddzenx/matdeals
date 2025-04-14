
import { useEffect } from 'react';

export default function EnvTest() {
  useEffect(() => {
    console.log('Environment Variables Test:');
    console.log('Using Supabase URL:', 'https://rnccetwpkhskcaxsqrig.supabase.co');
    console.log('Using Supabase Anon Key:', 'Present (hardcoded)');
    
    // Also log any environment variables if they exist
    if (typeof import.meta.env !== 'undefined') {
      console.log('Environment variables accessible:', true);
      console.log('VITE_SUPABASE_URL from env:', import.meta.env.VITE_SUPABASE_URL || 'Not found');
      console.log('VITE_SUPABASE_ANON_KEY from env:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    } else {
      console.log('Environment variables accessible:', false);
    }
  }, []);

  return null;
} 
