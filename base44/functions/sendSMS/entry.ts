import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, name, invitationLink } = await req.json();

    if (!phone) {
      return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const token = Deno.env.get("KUDISMS_API_TOKEN");

    // Format phone: ensure it starts with 234 (Nigeria)
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "234" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("234")) {
      formattedPhone = "234" + formattedPhone;
    }

    const message = `Hello ${name},\n\nThis is your invitation to the 5th Coronation Anniversary of Ogiame Atuwatse III, CFR, scheduled for August 21, 2026, by 10:00 AM.\n\nPlease use the link below to download your personalized invitation:\n${invitationLink}`;

    const formData = new FormData();
    formData.append("token", token);
    formData.append("senderID", "OGIAME III");
    formData.append("recipients", formattedPhone);
    formData.append("message", message);

    const response = await fetch("https://my.kudisms.net/api/corporate", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return Response.json({ error: "SMS provider error", details: result }, { status: 500 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});