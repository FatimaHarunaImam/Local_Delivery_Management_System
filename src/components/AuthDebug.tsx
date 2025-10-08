import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { supabase, apiCall } from "../utils/supabase/client";

export function AuthDebug() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [authTestResult, setAuthTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    setSessionInfo({ session: session?.user, error });
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      const result = await apiCall('/auth/test');
      setAuthTestResult({ success: true, result });
    } catch (error: any) {
      setAuthTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={checkSession}>Check Session</Button>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
          
          <div>
            <Button onClick={testAuth} disabled={loading}>
              {loading ? 'Testing...' : 'Test Backend Auth'}
            </Button>
            {authTestResult && (
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(authTestResult, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}