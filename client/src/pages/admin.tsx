import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, TrendingUp, Users, Gift, Database, Upload, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadCouponsCSV, type AdminStats, type AdminDistributions, type AdminCoupons, type UploadResponse } from "@/lib/api";

export default function Admin() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: distributions, isLoading: distributionsLoading } = useQuery<AdminDistributions>({
    queryKey: ["/api/admin/distributions"],
  });

  const { data: coupons, isLoading: couponsLoading } = useQuery<AdminCoupons>({
    queryKey: ["/api/admin/coupons"],
  });

  const uploadMutation = useMutation({
    mutationFn: uploadCouponsCSV,
    onSuccess: (data) => {
      setUploadResult(data);
      if (data.success) {
        toast({
          title: "Upload Successful",
          description: data.message,
        });
        // Invalidate all admin queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/distributions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
        setSelectedFile(null);
      } else {
        toast({
          title: "Upload Failed",
          description: data.message || "Failed to upload coupons",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive",
      });
      setUploadResult({
        success: false,
        error: "Network error",
        message: "Failed to upload file. Please try again."
      });
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const maskMobileNumber = (mobile: string) => {
    if (mobile.length <= 4) return mobile;
    const start = mobile.slice(0, 2);
    const end = mobile.slice(-2);
    const middle = "*".repeat(mobile.length - 4);
    return start + middle + end;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-slate-600">
            Monitor coupon distribution and system status
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Coupons</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {statsLoading ? "..." : stats?.data?.totalCoupons || 0}
                  </p>
                </div>
                <Database className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Distributed</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {statsLoading ? "..." : stats?.data?.distributedCoupons || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Available</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {statsLoading ? "..." : stats?.data?.availableCoupons || 0}
                  </p>
                </div>
                <Gift className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Distribution Rate</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {statsLoading ? "..." : `${stats?.data?.distributionRate || 0}%`}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CSV Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Coupon Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">CSV Format Requirements</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Upload a CSV file with coupon codes in a single column. Each row should contain one coupon code.
                  </p>
                  <p className="text-xs text-blue-600">
                    <strong>Note:</strong> Uploading new coupons will replace all existing codes and reset all distributions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={uploadMutation.isPending}
                  className="cursor-pointer"
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="flex items-center gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload CSV
                  </>
                )}
              </Button>
            </div>

            {selectedFile && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-slate-600">
                  Selected file: <span className="font-medium">{selectedFile.name}</span>
                  {' '}({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            )}

            {uploadResult && (
              <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertCircle className={`h-4 w-4 ${uploadResult.success ? "text-green-600" : "text-red-600"}`} />
                <AlertDescription className={uploadResult.success ? "text-green-800" : "text-red-800"}>
                  <div className="space-y-2">
                    <p className="font-medium">{uploadResult.message}</p>
                    {uploadResult.data && (
                      <div className="text-sm space-y-1">
                        <p>Total processed: {uploadResult.data.totalProcessed}</p>
                        <p>Successfully added: {uploadResult.data.successfullyAdded}</p>
                        {uploadResult.data.errors > 0 && (
                          <div>
                            <p>Errors: {uploadResult.data.errors}</p>
                            {uploadResult.data.errorDetails.length > 0 && (
                              <div className="mt-2 max-h-32 overflow-y-auto">
                                <p className="font-medium mb-1">Error details:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {uploadResult.data.errorDetails.slice(0, 10).map((error, index) => (
                                    <li key={index} className="text-xs">{error}</li>
                                  ))}
                                  {uploadResult.data.errorDetails.length > 10 && (
                                    <li className="text-xs italic">... and {uploadResult.data.errorDetails.length - 10} more</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Data Tables */}
        <Tabs defaultValue="distributions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="distributions">Distributions</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
          </TabsList>

          <TabsContent value="distributions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Coupon Distributions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {distributionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : distributions?.data && distributions.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Mobile Number</TableHead>
                          <TableHead>Coupon Code</TableHead>
                          <TableHead>Distributed At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {distributions.data.map((dist) => (
                          <TableRow key={dist.id}>
                            <TableCell className="font-mono">{dist.id}</TableCell>
                            <TableCell className="font-mono">
                              {maskMobileNumber(dist.mobileNumber)}
                            </TableCell>
                            <TableCell>
                              <Badge className="font-mono">{dist.couponCode}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {formatDate(dist.distributedAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No distributions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Coupon Codes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {couponsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : coupons?.data && coupons.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Coupon Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coupons.data.map((coupon) => (
                          <TableRow key={coupon.id}>
                            <TableCell className="font-mono">{coupon.id}</TableCell>
                            <TableCell>
                              <Badge className="font-mono">{coupon.code}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={coupon.isUsed ? "destructive" : "default"}
                                className={coupon.isUsed ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                              >
                                {coupon.isUsed ? "Used" : "Available"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {formatDate(coupon.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No coupons found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
