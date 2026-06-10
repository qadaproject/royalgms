// KudiSMS WhatsApp Template API
// Template: invitation_notices
// {{1}} = name, {{2}} = link
// Template code: 9115722281
// Phone Number ID: 1150257071506724

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, name, link } = await req.json();

    if (!phone || !name || !link) {
      return Response.json({ error: 'phone, name, and link are required' }, { status: 400 });
    }

    const token = Deno.env.get("KUDISMS_API_TOKEN");
    if (!token) {
      return Response.json({ error: 'KUDISMS_API_TOKEN secret must be set.' }, { status: 400 });
    }

    // Format phone: ensure it starts with 234 (Nigeria)
    let recipient = phone.toString().replace(/\D/g, "");
    if (recipient.startsWith("0")) {
      recipient = "234" + recipient.slice(1);
    } else if (!recipient.startsWith("234")) {
      recipient = "234" + recipient;
    }

    // Build form-encoded payload
    const params = new URLSearchParams();
    params.append("token", token);
    params.append("recipient", recipient);
    params.append("phone_number_id", "1150257071506724");
    params.append("template_code", "9115722281");
    params.append("parameters", `${name},${link}`);
    params.append("button_parameters", "");
    params.append("header_parameters", "");

    const response = await fetch("https://my.kudisms.net/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.json();

    if (!response.ok || result.status === "error" || result.success === false) {
      return Response.json({ error: result.message || "KudiSMS WhatsApp API error", details: result }, { status: 500 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});