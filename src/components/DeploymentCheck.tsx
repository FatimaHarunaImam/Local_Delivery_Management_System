import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiCall } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CheckResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'checking';
  message: string;
}

export function DeploymentCheck() {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const runChecks = async () => {
    setIsChecking(true);
    const results: CheckResult[] = [];

    // Check 1: Environment Variables
    results.push({
      name: 'Environment Variables',
      status: 'checking',
      message: 'Checking environment configuration...'
    });
    setChecks([...results]);

    const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL || !!projectId;
    const hasSupabaseKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY || !!publicAnonKey;
    
    results[0] = {
      name: 'Environment Variables',
      status: hasSupabaseUrl && hasSupabaseKey ? 'success' : 'error',
      message: hasSupabaseUrl && hasSupabaseKey 
        ? '✓ Supabase credentials configured' 
        : '✗ Missing Supabase credentials'
    };
    setChecks([...results]);

    // Check 2: Supabase Connection
    results.push({
      name: 'Supabase Connection',
      status: 'checking',
      message: 'Testing connection to Supabase...'
    });
    setChecks([...results]);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/rest/v1/`, {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      results[1] = {
        name: 'Supabase Connection',
        status: response.ok ? 'success' : 'error',
        message: response.ok 
          ? '✓ Connected to Supabase successfully' 
          : `✗ Connection failed (${response.status})`
      };
    } catch (error) {
      results[1] = {
        name: 'Supabase Connection',
        status: 'error',
        message: '✗ Cannot reach Supabase server'
      };
    }
    setChecks([...results]);

    // Check 3: Edge Function
    results.push({
      name: 'Edge Function',
      status: 'checking',
      message: 'Testing backend server...'
    });
    setChecks([...results]);

    try {
      const healthCheck = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aaf007a1/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      results[2] = {
        name: 'Edge Function',
        status: healthCheck.ok ? 'success' : 'error',
        message: healthCheck.ok 
          ? '✓ Backend server is running' 
          : `✗ Server returned ${healthCheck.status}`
      };
    } catch (error) {
      results[2] = {
        name: 'Edge Function',
        status: 'error',
        message: '✗ Backend server not reachable'
      };
    }
    setChecks([...results]);

    // Check 4: API Endpoint Test
    results.push({
      name: 'API Test',
      status: 'checking',
      message: 'Testing API endpoints...'
    });
    setChecks([...results]);

    try {
      await apiCall('/auth/test');
      results[3] = {
        name: 'API Test',
        status: 'success',
        message: '✓ API calls working correctly'
      };
    } catch (error) {
      results[3] = {
        name: 'API Test',
        status: 'warning',
        message: '⚠ Running in offline mode'
      };
    }
    setChecks([...results]);

    // Check 5: Browser Compatibility
    results.push({
      name: 'Browser Check',
      status: 'checking',
      message: 'Checking browser support...'
    });
    setChecks([...results]);

    const hasLocalStorage = typeof localStorage !== 'undefined';
    const hasFetch = typeof fetch !== 'undefined';
    
    results[4] = {
      name: 'Browser Check',
      status: hasLocalStorage && hasFetch ? 'success' : 'error',
      message: hasLocalStorage && hasFetch 
        ? '✓ Browser fully supported' 
        : '✗ Browser missing required features'
    };
    setChecks([...results]);

    setIsChecking(false);
  };

  useEffect(() => {
    runChecks();
  }, []);

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: CheckResult['status']) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      checking: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={`${colors[status]} border-0`}>
        {status === 'checking' ? 'Checking...' : status}
      </Badge>
    );
  };

  const allSuccessful = checks.every(c => c.status === 'success');
  const hasErrors = checks.some(c => c.status === 'error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--jetdash-brown)] mb-2">
            JetDash Deployment Check
          </h1>
          <p className="text-muted-foreground">
            Verifying your deployment configuration
          </p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-[var(--jetdash-brown)]">
                System Status
              </CardTitle>
              <Button
                onClick={runChecks}
                disabled={isChecking}
                variant="outline"
                size="sm"
                className="border-[var(--jetdash-orange)] text-[var(--jetdash-orange)]"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                Recheck
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checks.map((check, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <p className="font-semibold text-[var(--jetdash-brown)]">
                        {check.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {check.message}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(check.status)}
                </div>
              ))}
            </div>

            {checks.length > 0 && !isChecking && (
              <div className="mt-6 p-4 bg-gradient-to-r from-[var(--jetdash-brown)]/10 to-[var(--jetdash-orange)]/10 rounded-lg">
                {allSuccessful ? (
                  <div className="flex items-center space-x-3 text-green-700">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                      <p className="font-semibold">All systems operational!</p>
                      <p className="text-sm">Your JetDash deployment is fully configured.</p>
                    </div>
                  </div>
                ) : hasErrors ? (
                  <div className="flex items-center space-x-3 text-red-700">
                    <XCircle className="w-6 h-6" />
                    <div>
                      <p className="font-semibold">Configuration issues detected</p>
                      <p className="text-sm">Please check the deployment guide and fix the errors above.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-yellow-700">
                    <AlertCircle className="w-6 h-6" />
                    <div>
                      <p className="font-semibold">Partial functionality</p>
                      <p className="text-sm">App running in offline mode. Connect to backend for full features.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-[var(--jetdash-orange)]/5 to-[var(--jetdash-brown)]/5">
          <CardHeader>
            <CardTitle className="text-lg text-[var(--jetdash-brown)]">
              Configuration Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Environment</p>
                <p className="font-semibold text-[var(--jetdash-brown)]">
                  {import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'production'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Project ID</p>
                <p className="font-mono text-sm text-[var(--jetdash-brown)]">
                  {projectId}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">API Endpoint</p>
                <p className="font-mono text-xs text-[var(--jetdash-brown)] break-all">
                  {`https://${projectId}.supabase.co/functions/v1/make-server-aaf007a1`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="font-semibold text-[var(--jetdash-brown)]">1.0.0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Need help? Check the <span className="text-[var(--jetdash-orange)] font-semibold">DEPLOYMENT.md</span> file
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] text-white hover:from-[var(--jetdash-light-orange)] hover:to-[var(--jetdash-orange)]"
          >
            Continue to App
          </Button>
        </div>
      </div>
    </div>
  );
}
