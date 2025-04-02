import { useEffect } from 'react';

export default function EnvTest() {
  useEffect(() => {
    console.log('Environment Variables Test:');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
  }, []);

  return null;
} 