import { useEffect } from 'react';
import { getApiKey } from '@/utils/env';

export default function EnvTest() {
  useEffect(() => {
    console.log('Environment Variables Test:');
    try {
      const apiKey = getApiKey();
      console.log('API Key is valid:', true);
    } catch (error) {
      console.error('API Key is invalid:', error);
    }
  }, []);

  return null;
} 
