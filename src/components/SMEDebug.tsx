import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { apiCall } from "../utils/supabase/client";

interface SMEDebugProps {
  user: any;
  onBack: () => void;
}

export function SMEDebug({ user, onBack }: SMEDebugProps) {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string>("");

  const testEndpoint = async (endpoint: string, method: string = 'GET') => {
    try {
      setLoading(endpoint);
      const result = await apiCall(endpoint, { method });
      setResults(prev => ({ ...prev, [endpoint]: { success: true, data: result } }));
    } catch (error: any) {
      setResults(prev => ({ ...prev, [endpoint]: { success: false, error: error.message } }));
    } finally {
      setLoading("");
    }
  };

  const endpoints = [
    { name: "Auth Test", path: "/auth/test" },
    { name: "SME Test", path: "/sme/test" },
    { name: "SME Initialize", path: "/sme/initialize", method: "POST" },
    { name: "SME Dashboard", path: "/sme/dashboard" },
    { name: "User Profile", path: "/user/profile" }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[var(--jetdash-brown)]">SME Debug Panel</h1>
          <Button onClick={onBack} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {endpoints.map((endpoint) => (
                <div key={endpoint.path} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{endpoint.name}</h3>
                    <Button
                      onClick={() => testEndpoint(endpoint.path, endpoint.method)}
                      disabled={loading === endpoint.path}
                      size="sm"
                    >
                      {loading === endpoint.path ? "Testing..." : "Test"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {endpoint.method || 'GET'} {endpoint.path}
                  </p>
                  {results[endpoint.path] && (
                    <div className="mt-3">
                      <div className={`text-sm font-medium mb-2 ${
                        results[endpoint.path].success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {results[endpoint.path].success ? "✅ Success" : "❌ Failed"}
                      </div>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                        {JSON.stringify(
                          results[endpoint.path].success 
                            ? results[endpoint.path].data 
                            : results[endpoint.path].error, 
                          null, 
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setResults({});
                }}
                variant="outline"
              >
                Clear Results
              </Button>
              <Button
                onClick={() => {
                  endpoints.forEach(endpoint => {
                    setTimeout(() => testEndpoint(endpoint.path, endpoint.method), 100);
                  });
                }}
                disabled={!!loading}
              >
                Test All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}