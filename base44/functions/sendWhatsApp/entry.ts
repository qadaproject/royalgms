import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, messageBody, templateCode, parameters, buttonParameters, headerParameters } = await req.json();

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

    const body = new URLSearchParams();
    body.append("token", token);
    body.append("recipient", formattedPhone);
    body.append("template_code", templateCode || "");
    body.append("parameters", parameters || messageBody || "");
    body.append("button_parameters", buttonParameters || "");
    body.append("header_parameters", headerParameters || "");

    const response = await fetch("https://my.kudisms.net/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      return Response.json({ error: "WhatsApp provider error", details: result }, { status: 500 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});