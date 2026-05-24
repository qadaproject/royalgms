import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
    const senderID = Deno.env.get("KUDISMS_SENDER_ID") || "OGIAME";

    // Format phone: ensure it starts with 234 (Nigeria)
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "234" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("234")) {
      formattedPhone = "234" + formattedPhone;
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("senderID", senderID);
    formData.append("recipients", formattedPhone);
    formData.append("message", messageBody);
    formData.append("gateway", "2");

    const response = await fetch("https://my.kudisms.net/api/sms", {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch { result = { raw: text }; }

    if (result.status === "error") {
      return Response.json({ error: result.msg || "SMS provider error", details: result }, { status: 500 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});