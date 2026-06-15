import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, QrCode, Phone, Mail, User, MapPin, Utensils, AlertCircle, FileText } from "lucide-react";
import CategoryBadge from "../shared/CategoryBadge";
import StatusBadge from "../shared/StatusBadge";

function Field({ label, value, icon: Icon }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-3">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{String(value)}</p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-3 border-b border-border pb-1">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

export default function GuestViewModal({ guest, open, onOpenChange }) {
  if (!guest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Guest Profile</DialogTitle>
        </DialogHeader>

        {/* Identity Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground font-medium">{guest.formal_salutation}</p>
              <h2 className="font-heading text-2xl font-semibold text-foreground">{guest.full_name}</h2>
              {guest.post_nominals && (
                <p className="text-sm text-accent font-medium">{guest.post_nominals}</p>
              )}
              {guest.official_title && (
                <p className="text-sm text-muted-foreground mt-1">{guest.official_title}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <CategoryBadge category={guest.category} />
              <StatusBadge status={guest.rsvp_status || "Pending"} />
              {guest.protocol_validated ? (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Protocol Validated
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-medium">
                  <ShieldAlert className="w-3.5 h-3.5" /> Not Validated
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-2">
          <Section title="Contact Information">
            <Field label="Email" value={guest.email} icon={Mail} />
            <Field label="Phone" value={guest.phone} icon={Phone} />
          </Section>

          <Section title="Liaison / PA">
            <Field label="Contact Person" value={guest.contact_person_name} icon={User} />
            <Field label="PA Phone" value={guest.contact_person_phone} icon={Phone} />
            <Field label="PA Email" value={guest.contact_person_email} icon={Mail} />
          </Section>

          <Section title="Seating & Logistics">
            <Field label="Seating Zone" value={guest.seating_zone} icon={MapPin} />
            <Field label="Seat Number" value={guest.seat_number} icon={MapPin} />
            <Field label="Arrival Details" value={guest.arrival_details} />
            <Field label="Security Detail Size" value={guest.security_detail_size > 0 ? `${guest.security_detail_size} orderlies` : null} />
          </Section>

          <Section title="Special Requirements">
            <Field label="Dietary Requirements" value={guest.dietary_requirements} icon={Utensils} />
            <Field label="Medical Alerts" value={guest.medical_alerts} icon={AlertCircle} />
            <Field label="Special Requirements" value={guest.special_requirements} />
          </Section>

          {(guest.notes || guest.qr_code) && (
            <Section title="Internal">
              <Field label="Notes" value={guest.notes} icon={FileText} />
              <Field label="QR / Admission Token" value={guest.qr_code} icon={QrCode} />
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}