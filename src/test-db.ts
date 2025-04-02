import { config } from 'dotenv';
import { supabase } from './integrations/supabase/client';

// Load environment variables from .env file
config();

async function testAuthentication() {
  try {
    console.log('Testing Supabase authentication...');
    console.log('Using email:', process.env.VITE_TEST_EMAIL);

    // First, sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: process.env.VITE_TEST_EMAIL || '',
      password: process.env.VITE_TEST_PASSWORD || '',
    });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      return;
    }
    console.log('✅ Sign in successful');

    // Then test getting the user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth test failed:', authError.message);
      return;
    }
    console.log('✅ Auth test passed');
    console.log('Current user:', authData.user);

    // Sign out to clean up
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('❌ Sign out failed:', signOutError.message);
      return;
    }
    console.log('✅ Sign out successful');

    console.log('\n🎉 Authentication test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testAuthentication(); 