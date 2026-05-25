import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, AlertTriangle, Car, Utensils, Loader2 } from "lucide-react";
import RoyalCrest from "../components/layout/RoyalCrest";

export default function RSVPPortal() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("ref") || urlParams.get("token");

  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [rsvpStatus, setRsvpStatus] = useState("Accepted");
  const [dietary, setDietary] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [arrivalDetails, setArrivalDetails] = useState("");

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    base44.entities.Guest.filter({ qr_code: token }, "-created_date", 1)
      .then((results) => {
        if (results && results.length > 0) {
          const g = results[0];
          setGuest(g);
          setDietary(g.dietary_requirements || "");
          setArrivalDetails(g.arrival_details || "");
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [token]);

  const handleSubmit = async () => {
    if (!guest) return;
    setSubmitting(true);
    const arrivalFull = [vehicleModel, vehiclePlate, arrivalDetails].filter(Boolean).join(" | ");
    await base44.entities.Guest.update(guest.id, {
      rsvp_status: rsvpStatus,
      dietary_requirements: dietary,
      arrival_details: arrivalFull || guest.arrival_details,
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1a0a06] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a0a06] text-[#f5ede0] flex flex-col">
      {/* Header */}
      <header className="text-center py-10 px-4 border-b border-[#c9a84c]/20">
        <div className="flex justify-center mb-4">
          <RoyalCrest size="xl" />
        </div>
        <p className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-2">The Palace of</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-[#f5ede0] tracking-wide">
          Ògíame Atúwàtse III, CFR
        </h1>
        <p className="text-[#c9a84c]/80 text-sm mt-1 tracking-wide">The Olu of Warri</p>
        <div className="w-24 h-px bg-[#c9a84c]/40 mx-auto mt-4" />
        <p className="text-[#f5ede0]/60 text-xs mt-3 uppercase tracking-widest">5th Coronation Anniversary</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        {notFound ? (
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-[#c9a84c] mx-auto mb-4" />
            <h2 className="font-heading text-2xl mb-2">Invalid Invitation</h2>
            <p className="text-[#f5ede0]/60 text-sm">
              This RSVP link is not valid or has expired. Please contact the protocol office.
            </p>
          </div>
        ) : submitted ? (
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/40 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#c9a84c]" />
            </div>
            <h2 className="font-heading text-2xl mb-2">Response Received</h2>
            <p className="text-[#f5ede0]/70 text-sm leading-relaxed">
              Your RSVP has been recorded, {guest?.formal_salutation} {guest?.full_name}.<br />
              The Royal Household is honoured by your response.
            </p>
            {rsvpStatus === "Accepted" && (
              <div className="mt-6 p-4 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-lg text-sm text-[#c9a84c]">
                Further details on venue access and protocol will be communicated through your contact.
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-lg">
            {/* Guest greeting */}
            <div className="text-center mb-8">
              <p className="text-[#c9a84c]/70 text-xs uppercase tracking-widest mb-2">Royal Invitation</p>
              <h2 className="font-heading text-xl sm:text-2xl text-[#f5ede0]">
                {guest?.formal_salutation} {guest?.full_name}
              </h2>
              {guest?.official_title && (
                <p className="text-[#f5ede0]/60 text-sm mt-1">{guest.official_title}</p>
              )}
            </div>

            <div className="bg-[#2a110a]/60 border border-[#c9a84c]/20 rounded-xl p-6 space-y-6">
              {/* Attendance */}
              <div>
                <Label className="text-[#c9a84c] text-xs uppercase tracking-wider mb-3 block flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Attendance Confirmation
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {["Accepted", "Declined", "Proxy"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setRsvpStatus(opt)}
                      className={`py-2.5 px-3 rounded-lg text-sm border transition-all font-medium ${
                        rsvpStatus === opt
                          ? "bg-[#c9a84c] text-[#1a0a06] border-[#c9a84c]"
                          : "bg-transparent text-[#f5ede0]/70 border-[#c9a84c]/20 hover:border-[#c9a84c]/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {rsvpStatus !== "Declined" && (
                <>
                  {/* Dietary */}
                  <div>
                    <Label className="text-[#c9a84c] text-xs uppercase tracking-wider mb-2 block flex items-center gap-2">
                      <Utensils className="w-3.5 h-3.5" /> Dietary Requirements
                    </Label>
                    <Textarea
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      placeholder="e.g. Halal, Vegetarian, Nut allergy, No restrictions..."
                      className="bg-[#1a0a06]/60 border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30 focus:border-[#c9a84c]/60 resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Vehicle Details */}
                  <div>
                    <Label className="text-[#c9a84c] text-xs uppercase tracking-wider mb-2 block flex items-center gap-2">
                      <Car className="w-3.5 h-3.5" /> Vehicle Details (for gate clearance)
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Input
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          placeholder="Vehicle make/model"
                          className="bg-[#1a0a06]/60 border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30 focus:border-[#c9a84c]/60"
                        />
                      </div>
                      <div>
                        <Input
                          value={vehiclePlate}
                          onChange={(e) => setVehiclePlate(e.target.value)}
                          placeholder="Plate number"
                          className="bg-[#1a0a06]/60 border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30 focus:border-[#c9a84c]/60"
                        />
                      </div>
                    </div>
                    <Textarea
                      value={arrivalDetails}
                      onChange={(e) => setArrivalDetails(e.target.value)}
                      placeholder="Flight info, estimated arrival time, convoy details..."
                      className="bg-[#1a0a06]/60 border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30 focus:border-[#c9a84c]/60 resize-none mt-2"
                      rows={2}
                    />
                  </div>
                </>
              )}

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#c9a84c] hover:bg-[#b8963e] text-[#1a0a06] font-semibold py-3 h-auto"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit RSVP Response
              </Button>
            </div>

            <p className="text-center text-[#f5ede0]/30 text-xs mt-4">
              This portal is secured and accessible only via your personal invitation link.
            </p>
          </div>
        )}
      </main>

      <footer className="text-center py-6 border-t border-[#c9a84c]/10">
        <p className="text-[#f5ede0]/30 text-xs">© The Royal Palace — Warri Kingdom</p>
      </footer>
    </div>
  );
}