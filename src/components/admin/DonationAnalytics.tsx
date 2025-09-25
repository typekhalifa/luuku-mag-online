import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, Users } from "lucide-react";

interface Donation {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  donor_name?: string;
  donor_email?: string;
  payment_method: string;
  payment_status: string;
  message?: string;
  is_anonymous: boolean;
}

interface DonationStats {
  totalAmount: number;
  totalDonations: number;
  averageDonation: number;
  topCurrency: string;
  recentDonations: Donation[];
  statusBreakdown: Record<string, number>;
  methodBreakdown: Record<string, number>;
}

const PERIODS = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "All Time", value: "all" },
];

const getFromDate = (period: string): string | null => {
  if (period === "all") return null;
  const days = parseInt(period, 10);
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const fetchDonationStats = async (period: string): Promise<DonationStats> => {
  const fromDate = getFromDate(period);
  
  let query = supabase.from("donations").select("*");
  
  if (fromDate) {
    query = query.gte("created_at", fromDate);
  }

  const { data: donations, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching donations:", error);
    return {
      totalAmount: 0,
      totalDonations: 0,
      averageDonation: 0,
      topCurrency: "USD",
      recentDonations: [],
      statusBreakdown: {},
      methodBreakdown: {},
    };
  }

  const totalAmount = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const totalDonations = donations?.length || 0;
  const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

  // Currency breakdown
  const currencyBreakdown = donations?.reduce((acc, d) => {
    acc[d.currency] = (acc[d.currency] || 0) + Number(d.amount);
    return acc;
  }, {} as Record<string, number>) || {};
  
  const topCurrency = Object.keys(currencyBreakdown).reduce((a, b) => 
    currencyBreakdown[a] > currencyBreakdown[b] ? a : b, "USD"
  );

  // Status breakdown
  const statusBreakdown = donations?.reduce((acc, d) => {
    acc[d.payment_status] = (acc[d.payment_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Payment method breakdown
  const methodBreakdown = donations?.reduce((acc, d) => {
    acc[d.payment_method] = (acc[d.payment_method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    totalAmount,
    totalDonations,
    averageDonation,
    topCurrency,
    recentDonations: donations?.slice(0, 10) || [],
    statusBreakdown,
    methodBreakdown,
  };
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "completed":
    case "success":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

const DonationAnalytics: React.FC = () => {
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DonationStats>({
    totalAmount: 0,
    totalDonations: 0,
    averageDonation: 0,
    topCurrency: "USD",
    recentDonations: [],
    statusBreakdown: {},
    methodBreakdown: {},
  });

  useEffect(() => {
    setLoading(true);
    fetchDonationStats(period)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading donation analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Donation Analytics</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalAmount.toLocaleString('en-US', {
                style: 'currency',
                currency: stats.topCurrency
              })}
            </div>
            <p className="text-xs opacity-80">
              {period !== "all" ? `Last ${period} days` : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonations.toLocaleString()}</div>
            <p className="text-xs opacity-80">
              {period !== "all" ? `Last ${period} days` : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageDonation.toLocaleString('en-US', {
                style: 'currency',
                currency: stats.topCurrency
              })}
            </div>
            <p className="text-xs opacity-80">Per donation</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalDonations > 0 
                ? Math.round(((stats.statusBreakdown.completed || 0) + (stats.statusBreakdown.success || 0)) / stats.totalDonations * 100)
                : 0}%
            </div>
            <p className="text-xs opacity-80">Successful payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              Latest donations {period !== "all" ? `from the last ${period} days` : "of all time"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {donation.is_anonymous 
                      ? "Anonymous" 
                      : donation.donor_name || donation.donor_email || "Unknown"
                    }
                  </TableCell>
                  <TableCell className="font-semibold">
                    {Number(donation.amount).toLocaleString('en-US', {
                      style: 'currency',
                      currency: donation.currency
                    })}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-muted rounded text-xs capitalize">
                      {donation.payment_method}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(donation.payment_status)}>
                      {donation.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {donation.message || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationAnalytics;