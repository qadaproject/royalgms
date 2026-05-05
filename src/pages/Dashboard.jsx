import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, CheckCircle2, Clock, Send, AlertTriangle, Crown } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import StatCard from "../components/shared/StatCard";
import DashboardRSVPChart from "../components/dashboard/RSVPChart";
import DashboardCategoryBreakdown from "../components/dashboard/CategoryBreakdown";
import RecentActivity from "../components/dashboard/RecentActivity";
import NoShowAlerts from "../components/dashboard/NoShowAlerts";
import TierRSVPChart from "../components/dashboard/TierRSVPChart";
import ZoneCapacityLive from "../components/dashboard/ZoneCapacityLive";
import ArrivalTracker from "../components/dashboard/ArrivalTracker";
import VIPCheckInAlerts from "../components/dashboard/VIPCheckInAlerts";

export default function Dashboard() {
  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 500),
    refetchInterval: 10000,
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => base44.entities.Invitation.list("-created_date", 500),
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
        subtitle="5th Coronation Anniversary — Ogiame Atuwatse III"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Guests" value={guests.length} icon={Users} accent />
        <StatCard label="Accepted" value={accepted} icon={CheckCircle2} trend={`${guests.length ? Math.round((accepted / guests.length) * 100) : 0}% response rate`} />
        <StatCard label="Pending" value={pending} icon={Clock} />
        <StatCard label="Declined" value={declined} icon={AlertTriangle} />
        <StatCard label="Delivered" value={delivered} icon={Send} trend={`of ${invitations.length} dispatched`} />
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

      <VIPCheckInAlerts guests={guests} />
    </div>
  );
}