import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Clock, Search, Users } from "lucide-react";
import CategoryBadge from "../shared/CategoryBadge";

export default function CheckInReport({ guests }) {
  const [searchCheckedIn, setSearchCheckedIn] = useState("");
  const [searchNotArrived, setSearchNotArrived] = useState("");

  const checkedIn = guests.filter((g) => g.rsvp_status === "Accepted");
  const notArrived = guests.filter((g) => g.rsvp_status !== "Accepted");

  const filteredCheckedIn = checkedIn.filter((g) =>
    g.full_name?.toLowerCase().includes(searchCheckedIn.toLowerCase()) ||
    g.official_title?.toLowerCase().includes(searchCheckedIn.toLowerCase())
  );

  const filteredNotArrived = notArrived.filter((g) =>
    g.full_name?.toLowerCase().includes(searchNotArrived.toLowerCase()) ||
    g.official_title?.toLowerCase().includes(searchNotArrived.toLowerCase())
  );

  const rate = guests.length > 0 ? Math.round((checkedIn.length / guests.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-700">{checkedIn.length}</p>
                <p className="text-xs text-emerald-600 font-medium">Checked In / Arrived</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-700">{notArrived.length}</p>
                <p className="text-xs text-amber-600 font-medium">Not Yet Arrived</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{rate}%</p>
                <p className="text-xs text-muted-foreground font-medium">Arrival Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-column lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Checked In */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              Arrived on Site
              <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-emerald-200">{checkedIn.length}</Badge>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchCheckedIn}
                onChange={(e) => setSearchCheckedIn(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {filteredCheckedIn.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No guests found</p>
              ) : (
                filteredCheckedIn.map((g) => (
                  <GuestRow key={g.id} guest={g} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Not Arrived */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700">
              <Clock className="w-4 h-4" />
              Not Yet Arrived
              <Badge className="ml-auto bg-amber-100 text-amber-700 border-amber-200">{notArrived.length}</Badge>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchNotArrived}
                onChange={(e) => setSearchNotArrived(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {filteredNotArrived.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No guests found</p>
              ) : (
                filteredNotArrived.map((g) => (
                  <GuestRow key={g.id} guest={g} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GuestRow({ guest }) {
  const statusColors = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Declined: "bg-red-100 text-red-700 border-red-200",
    Proxy: "bg-blue-100 text-blue-700 border-blue-200",
    Accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {guest.formal_salutation ? `${guest.formal_salutation} ` : ""}{guest.full_name}
          {guest.post_nominals ? <span className="text-muted-foreground font-normal text-xs"> {guest.post_nominals}</span> : ""}
        </p>
        {guest.official_title && (
          <p className="text-xs text-muted-foreground truncate">{guest.official_title}</p>
        )}
      </div>
      <CategoryBadge category={guest.category} compact />
      <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[guest.rsvp_status] || statusColors.Pending}`}>
        {guest.rsvp_status || "Pending"}
      </Badge>
    </div>
  );
}