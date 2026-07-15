import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, CheckCircle2, Clock, Send, AlertTriangle, LayoutDashboard, Shield, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "../components/shared/PageHeader";
import StatCard from "../components/shared/StatCard";
import DashboardRSVPChart from "../components/dashboard/RSVPChart";
import DashboardCategoryBreakdown from "../components/dashboard/CategoryBreakdown";
import RecentActivity from "../components/dashboard/RecentActivity";
import NoShowAlerts from "../components/dashboard/NoShowAlerts";
import TierRSVPChart from "../components/dashboard/TierRSVPChart";
import ZoneCapacityLive from "../components/dashboard/ZoneCapacityLive";
import ArrivalTracker from "../components/dashboard/ArrivalTracker";
import EventCountdown from "../components/dashboard/EventCountdown";
import CategoryRSVPWidget from "../components/dashboard/CategoryRSVPWidget";
import SecurityActivityFeed from "../components/dashboard/SecurityActivityFeed";
import NotificationMetrics from "../components/dashboard/NotificationMetrics";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await base44.auth.resetPasswordRequest(user.email);
    } catch {}
    toast.success("Password reset link sent to your email");
  };

  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 10000),
    refetchInterval: 10000,
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => base44.entities.Invitation.list("-created_date", 10000),
  });

  const { data: zones = [] } = useQuery({
    queryKey: ["zones"],
    queryFn: () => base44.entities.SeatingZone.list("-created_date", 100),
    refetchInterval: 30000,
  });

  const accepted = guests.filter((g) => g.rsvp_status === "Accepted").length;
  const pending = guests.filter((g) => g.rsvp_status === "Pending").length;
  const declined = guests.filter((g) => g.rsvp_status === "Declined").length;
  const delivered = invitations.filter((i) => i.delivery_status === "Delivered").length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="5th Coronation Anniversary — Ògíame Atúwàtse III, CFR"
      >
        <Button variant="outline" size="sm" onClick={handlePasswordReset}>
          <KeyRound className="w-3.5 h-3.5 mr-2" />
          Reset My Password
        </Button>
      </PageHeader>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "overview" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "security" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Shield className="w-3.5 h-3.5" /> Security Activity
        </button>
      </div>

      {activeTab === "security" ? (
        <SecurityActivityFeed />
      ) : (
      <>
      <EventCountdown />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Guests" value={guests.length} icon={Users} accent />
        <StatCard label="Accepted" value={accepted} icon={CheckCircle2} trend={`${guests.length ? Math.round((accepted / guests.length) * 100) : 0}% response rate`} />
        <StatCard label="Pending" value={pending} icon={Clock} />
        <StatCard label="Declined" value={declined} icon={AlertTriangle} />
        <StatCard label="Delivered" value={delivered} icon={Send} trend={`of ${invitations.length} dispatched`} />
      </div>

      {/* Notifications Metric */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <NotificationMetrics totalGuests={guests.length} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DashboardRSVPChart guests={guests} />
        <DashboardCategoryBreakdown guests={guests} />
      </div>

      {/* Tier RSVP Chart */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <TierRSVPChart guests={guests} invitations={invitations} />
      </div>

      {/* Category RSVP Breakdown */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <CategoryRSVPWidget guests={guests} />
      </div>

      {/* Live Zone Capacity + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <ZoneCapacityLive zones={zones} guests={guests} />
        </div>
        <div className="lg:col-span-2">
          <NoShowAlerts guests={guests} invitations={invitations} />
        </div>
      </div>

      {/* Arrival Tracker */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <ArrivalTracker guests={guests} />
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 gap-6">
        <RecentActivity guests={guests} invitations={invitations} />
      </div>
      </>
      )}

    </div>
  );
}