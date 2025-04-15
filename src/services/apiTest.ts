import { getApiKey } from '@/utils/env';

export const testApiKey = async () => {
  try {
    const apiKey = getApiKey();
    console.log('API Key length:', apiKey.length); // Log the length of the API key (not the actual key)
    
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data.slice(0, 3) // Return first 3 models as test data
    };
  } catch (error) {
    console.error('API Test Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}; 