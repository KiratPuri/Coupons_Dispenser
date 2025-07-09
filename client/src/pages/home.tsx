import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { testCouponAPI, type CouponResponse } from "@/lib/api";
import { Loader2, Gift, Shield, Zap } from "lucide-react";

export default function Home() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [result, setResult] = useState<CouponResponse | null>(null);

  const couponMutation = useMutation({
    mutationFn: async (mobile: string) => {
      const response = await testCouponAPI(mobile);
      return response.json() as Promise<CouponResponse>;
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error: any) => {
      console.error("API Error:", error);
      setResult({
        success: false,
        error: "Network error",
        message: "Failed to connect to the API. Please try again."
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.trim()) {
      couponMutation.mutate(mobileNumber.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="mb-12 lg:mb-0">
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Get Your Unique <span className="text-primary">Coupon Code</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Enter your mobile number to receive an exclusive coupon code. 
                Each mobile number gets exactly one unique coupon - no duplicates, guaranteed.
              </p>
              
              {/* API Test Form */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    Get Your Coupon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="tel"
                        placeholder="Enter your mobile number (e.g., +1234567890)"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        disabled={couponMutation.isPending}
                        className="text-lg"
                      />
                      <p className="text-sm text-slate-500 mt-1">
                        Format: +[country code][number] or just the number
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={!mobileNumber.trim() || couponMutation.isPending}
                      className="w-full"
                      size="lg"
                    >
                      {couponMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting Coupon...
                        </>
                      ) : (
                        "Get Coupon Code"
                      )}
                    </Button>
                  </form>

                  {/* Results */}
                  {result && (
                    <div className="mt-6">
                      {result.success ? (
                        <Alert className="border-green-200 bg-green-50">
                          <Gift className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            <div className="space-y-2">
                              <p className="font-semibold">Success! Your coupon code:</p>
                              <div className="bg-white p-3 rounded border">
                                <code className="text-lg font-bold text-primary">
                                  {result.data?.couponCode}
                                </code>
                              </div>
                              <p className="text-sm">{result.data?.message}</p>
                              <p className="text-xs text-green-600">
                                Distributed: {new Date(result.data?.distributedAt || "").toLocaleString()}
                              </p>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertDescription className="text-red-800">
                            <div className="space-y-2">
                              <p className="font-semibold">Error: {result.error}</p>
                              <p>{result.message}</p>
                              {result.retryAfter && (
                                <p className="text-sm">Retry after: {result.retryAfter}</p>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center text-sm text-slate-500">
                <Shield className="h-4 w-4 mr-2 text-green-500" />
                <span>Secure • Rate Limited • One coupon per mobile number</span>
              </div>
            </div>
            
            {/* Features Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-900">API Features</h3>
                  <Badge className="bg-secondary/10 text-secondary">
                    Production Ready
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium">Mobile Number Validation</span>
                  </div>
                  <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium">Unique Coupon Distribution</span>
                  </div>
                  <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="font-medium">Duplicate Prevention</span>
                  </div>
                  <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="font-medium">Rate Limiting Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Robust Coupon Distribution System
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Built with enterprise-grade features for reliable coupon distribution.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Shield className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Input Validation</h3>
              <p className="text-slate-600 leading-relaxed">
                Comprehensive mobile number validation ensures only valid phone numbers receive coupons.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="text-secondary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Rate Limiting</h3>
              <p className="text-slate-600 leading-relaxed">
                Built-in protection against abuse with configurable rate limits per IP address.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Gift className="text-accent h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Unique Distribution</h3>
              <p className="text-slate-600 leading-relaxed">
                Each mobile number receives exactly one coupon code with prevention of duplicates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
