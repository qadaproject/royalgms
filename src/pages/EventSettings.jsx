import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, CalendarDays, MapPin, Mail, FileText, MessageSquare, History } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import PageHeader from "../components/shared/PageHeader";

const defaults = {
  event_name: "5th Coronation Anniversary",
  event_subtitle: "Ògíame Atúwàtse III, CFR, Olu of Warri Kingdom",
  event_date: "",
  event_time: "10:00 AM",
  venue_name: "Royal Palace Grounds",
  venue_address: "Warri, Delta State, Nigeria",
  dress_code: "Traditional Royal Attire / Black Tie",
  invitation_body: "By command of His Royal Majesty, you are graciously requested to attend the 5th Coronation Anniversary Ceremony in honour of Ògíame Atúwàtse III, CFR, Olu of Warri Kingdom.",
  email_subject: "Royal RSVP — 5th Coronation Anniversary of Ògíame Atúwàtse III, CFR",
  email_template: "Your Royal Highness / Your Excellency / Distinguished Guest,\n\nThe Royal Palace of Ògíame Atúwàtse III, CFR, The Olu of Warri, formally requests the honour of your presence at the 5th Coronation Anniversary celebrations.\n\nDear {{name}},\n\nPlease download your personalized invitation via the link below:\n{{link}}\n\nYour timely response will enable the Protocol Office to make adequate arrangements.\n\nPresented with the highest regard,\nThe Royal Protocol Office\nAghofen, Warri Kingdom",
  sms_template: "Hello {{name}}, you are cordially invited to the 5th Coronation Anniversary of Ogiame Atuwatse III, CFR. Download your invitation: {{link}}",
  rsvp_deadline: "",
  contact_name: "Protocol Office",
  contact_phone: "",
  contact_email: "",
  footer_note: "This invitation is non-transferable. Please present upon arrival at the security checkpoint.",
  additional_venues: "",
};

export default function EventSettings() {
  const [form, setForm] = useState(defaults);
  const queryClient = useQueryClient();

  const { data: settings = [] } = useQuery({
    queryKey: ["event_settings"],
    queryFn: () => base44.entities.EventSettings.list("-created_date", 1),
  });

  const existing = settings[0];

  useEffect(() => {
    if (existing) setForm({ ...defaults, ...existing });
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      existing?.id
        ? base44.entities.EventSettings.update(existing.id, data)
        : base44.entities.EventSettings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_settings"] });
      toast.success("Event settings saved");
    },
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      <PageHeader title="Event Settings" subtitle="Configure event details used across invitations and reports">
        <Button variant="outline" asChild>
          <Link to="/event-history">
            <History className="w-4 h-4 mr-2" /> Event History
          </Link>
        </Button>
        <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Details */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <CalendarDays className="w-4 h-4 text-accent" />
            <CardTitle className="font-heading text-lg">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Event Name</Label>
              <Input value={form.event_name} onChange={(e) => update("event_name", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Subtitle / Theme</Label>
              <Input value={form.event_subtitle} onChange={(e) => update("event_subtitle", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Event Date</Label>
                <Input type="date" value={form.event_date} onChange={(e) => update("event_date", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Event Time</Label>
                <Input value={form.event_time} onChange={(e) => update("event_time", e.target.value)} placeholder="e.g. 10:00 AM" />
              </div>
            </div>
            <div>
              <Label className="text-xs">RSVP Deadline</Label>
              <Input type="date" value={form.rsvp_deadline} onChange={(e) => update("rsvp_deadline", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Dress Code</Label>
              <Input value={form.dress_code} onChange={(e) => update("dress_code", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Venue */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            <CardTitle className="font-heading text-lg">Venue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Primary Venue Name</Label>
              <Input value={form.venue_name} onChange={(e) => update("venue_name", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Venue Address</Label>
              <Textarea value={form.venue_address} onChange={(e) => update("venue_address", e.target.value)} className="h-20" />
            </div>
            <div>
              <Label className="text-xs">Additional Venues / Satellite Locations</Label>
              <Textarea value={form.additional_venues} onChange={(e) => update("additional_venues", e.target.value)} placeholder="List any additional venues or sub-locations..." className="h-24" />
            </div>
          </CardContent>
        </Card>

        {/* Invitation Content */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <CardTitle className="font-heading text-lg">Invitation Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Invitation Body Text</Label>
              <Textarea value={form.invitation_body} onChange={(e) => update("invitation_body", e.target.value)} className="h-32" />
            </div>
            <div>
              <Label className="text-xs">Footer Note</Label>
              <Textarea value={form.footer_note} onChange={(e) => update("footer_note", e.target.value)} className="h-20" />
            </div>
          </CardContent>
        </Card>

        {/* Notification Templates */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent" />
            <CardTitle className="font-heading text-lg">Notification Message Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">{"{{name}}"}</code> for guest name and <code className="bg-muted px-1 rounded">{"{{link}}"}</code> for invitation link. These will be auto-substituted when sending.</p>
            <div>
              <Label className="text-xs">Email Subject</Label>
              <Input value={form.email_subject || ""} onChange={(e) => update("email_subject", e.target.value)} placeholder="Email subject line..." />
            </div>
            <div>
              <Label className="text-xs">Email Body Template</Label>
              <Textarea value={form.email_template || ""} onChange={(e) => update("email_template", e.target.value)} className="h-40" placeholder="Email body... use {{name}} and {{link}}" />
            </div>
            <div>
              <Label className="text-xs">SMS / WhatsApp Template</Label>
              <Textarea value={form.sms_template || ""} onChange={(e) => update("sms_template", e.target.value)} className="h-24" placeholder="SMS/WhatsApp body... use {{name}} and {{link}}" />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <Mail className="w-4 h-4 text-accent" />
            <CardTitle className="font-heading text-lg">Protocol Office Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Contact Name</Label>
              <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}