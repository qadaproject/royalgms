import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// NOTE: KudiSMS WhatsApp API requires a pre-approved template_code.
// The messageBody is passed as the "parameters" field to fill template variables.
// Set KUDISMS_WHATSAPP_TEMPLATE in environment variables with your approved template code.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, messageBody } = await req.json();

    if (!phone || !messageBody) {
      return Response.json({ error: 'Phone and messageBody are required' }, { status: 400 });
    }

    const token = Deno.env.get("KUDISMS_API_TOKEN");
    const templateCode = Deno.env.get("KUDISMS_WHATSAPP_TEMPLATE") || "";

    if (!templateCode) {
      return Response.json({ error: 'KUDISMS_WHATSAPP_TEMPLATE secret is not set. Please add your approved WhatsApp template code in app secrets.' }, { status: 400 });
    }

    // Format phone: ensure it starts with 234 (Nigeria)
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "234" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("234")) {
      formattedPhone = "234" + formattedPhone;
    }

    const body = new URLSearchParams();
    body.append("token", token);
    body.append("recipient", formattedPhone);
    body.append("template_code", templateCode);
    body.append("parameters", messageBody);
    body.append("button_parameters", "");
    body.append("header_parameters", "");

    const response = await fetch("https://my.kudisms.net/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch { result = { raw: text }; }

    if (result.status === "error") {
      return Response.json({ error: result.msg || "WhatsApp provider error", details: result }, { status: 500 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});