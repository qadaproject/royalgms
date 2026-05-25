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

    // Normalize to 234XXXXXXXXXX format
    let formattedPhone = phone.toString().replace(/\D/g, "");
    if (formattedPhone.startsWith("234") && formattedPhone.length === 13) {
      // already correct
    } else if (formattedPhone.startsWith("0") && formattedPhone.length === 11) {
      formattedPhone = "234" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("234")) {
      formattedPhone = "234" + formattedPhone;
    }

    // Use URL-encoded form body (more reliable than FormData for this API)
    const params = new URLSearchParams();
    params.append("token", token);
    params.append("senderID", senderID);
    params.append("recipients", formattedPhone);
    params.append("message", messageBody);
    params.append("gateway", "2");

    const response = await fetch("https://my.kudisms.net/api/sms", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
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