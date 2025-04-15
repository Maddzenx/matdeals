import { useState } from 'react';
import { testApiKey } from '@/services/apiTest';
import { validateEnv } from '@/utils/env';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';

export function ApiTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    data?: any[];
    error?: string;
  } | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      console.log('Starting API key test...');
      
      // First validate environment variables
      validateEnv();
      console.log('Environment variables validated successfully');
      
      // Then test the API key
      const testResult = await testApiKey();
      console.log('API test result:', testResult);
      
      setResult(testResult);
    } catch (error) {
      console.error('Error during API test:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>API Key Test</CardTitle>
        <CardDescription>
          Test if your API key is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test API Key'}
        </Button>

        {result && (
          <div className="mt-4">
            {result.success ? (
              <Alert className="bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  <p>API key is working correctly.</p>
                  <p className="mt-2 text-sm">
                    Available models:
                    <ul className="list-disc list-inside mt-1">
                      {result.data?.map((model, index) => (
                        <li key={index}>{model.id}</li>
                      ))}
                    </ul>
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {result.error || 'Failed to verify API key'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 