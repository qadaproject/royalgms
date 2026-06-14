import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/shared/PageHeader";
import RSVPSummaryReport from "../components/reports/RSVPSummaryReport";
import DispatchReport from "../components/reports/DispatchReport";
import VIPAlertReport from "../components/reports/VIPAlertReport";
import CheckInReport from "../components/reports/CheckInReport";

export default function Reports() {
  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 500),
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => base44.entities.Invitation.list("-created_date", 500),
  });

  return (
    <div>
      <PageHeader title="Reports" subtitle="Real-time analytics and alerts" />
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Check-In Status</h2>
          <CheckInReport guests={guests} />
        </div>
        <RSVPSummaryReport guests={guests} />
        <DispatchReport invitations={invitations} />
        <VIPAlertReport guests={guests} invitations={invitations} />
      </div>
    </div>
  );
}