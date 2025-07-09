import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Globe, Shield, Zap } from "lucide-react";

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Coupon Distribution API
          </h1>
          <p className="text-xl text-slate-600">
            Simple REST API for distributing unique coupon codes to mobile numbers
          </p>
        </div>

        {/* API Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              API Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Base URL</p>
                <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                  {window.location.origin}/api
                </code>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Format</p>
                <code className="bg-slate-100 px-2 py-1 rounded text-sm">JSON</code>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Rate Limited
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Real-time
              </Badge>
              <Badge variant="outline">No Auth Required</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Get Coupon Endpoint */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Get Coupon Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-green-100 text-green-800">GET</Badge>
                <code className="text-lg">/api/coupon</code>
              </div>
              <p className="text-slate-600">
                Distributes a unique coupon code to the provided mobile number.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Query Parameters</h4>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <code className="font-medium">mobileNumber</code>
                    <Badge variant="destructive" className="text-xs">required</Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Mobile phone number (10-15 digits, optional + prefix)
                  </p>
                  <p className="text-xs text-slate-500">
                    Example: +1234567890 or 1234567890
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Example Request</h4>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <code>
                  GET {window.location.origin}/api/coupon?mobileNumber=+1234567890
                </code>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Success Response (200)</h4>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">{`{
  "success": true,
  "data": {
    "mobileNumber": "+1234567890",
    "couponCode": "SAVE10",
    "distributedAt": "2024-01-15T10:30:00.000Z",
    "message": "Coupon successfully distributed"
  }
}`}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Error Responses</h4>
              <div className="space-y-4">
                <div>
                  <Badge className="bg-red-100 text-red-800 mb-2">400 Bad Request</Badge>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">{`{
  "success": false,
  "error": "Invalid mobile number",
  "message": "Mobile number must be at least 10 digits",
  "details": [...]
}`}</pre>
                  </div>
                </div>

                <div>
                  <Badge className="bg-yellow-100 text-yellow-800 mb-2">410 Gone</Badge>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">{`{
  "success": false,
  "error": "No coupons available",
  "message": "All coupon codes have been distributed. Please contact support."
}`}</pre>
                  </div>
                </div>

                <div>
                  <Badge className="bg-orange-100 text-orange-800 mb-2">429 Too Many Requests</Badge>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">{`{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": "60 seconds"
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Rules */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Business Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">One Coupon Per Mobile Number</p>
                  <p className="text-slate-600 text-sm">
                    Each mobile number can only receive one coupon code. Subsequent requests return the same coupon.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Rate Limiting</p>
                  <p className="text-slate-600 text-sm">
                    Maximum 10 requests per minute per IP address to prevent abuse.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Mobile Number Validation</p>
                  <p className="text-slate-600 text-sm">
                    Must be 10-15 digits, optionally prefixed with +. Only numbers and + allowed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Finite Coupon Pool</p>
                  <p className="text-slate-600 text-sm">
                    Limited number of preset coupon codes available. API returns 410 when exhausted.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">JavaScript/Fetch</h4>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">{`const getCoupon = async (mobileNumber) => {
  try {
    const response = await fetch(
      \`/api/coupon?mobileNumber=\${encodeURIComponent(mobileNumber)}\`
    );
    const data = await response.json();
    
    if (data.success) {
      console.log('Coupon Code:', data.data.couponCode);
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};`}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">cURL</h4>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <code>
                  curl -X GET "{window.location.origin}/api/coupon?mobileNumber=%2B1234567890"
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
