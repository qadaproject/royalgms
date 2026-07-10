Deno.serve(async (req) => {
  try {
    const { phone, messageBody } = await req.json();

    if (!phone || !messageBody) {
      return Response.json({ error: 'Phone and messageBody are required' }, { status: 400 });
    }

    const token = Deno.env.get("KUDISMS_API_TOKEN");
    const senderID = Deno.env.get("KUDISMS_SENDER_ID") || "OLUOF WARRI";

    if (!token) {
      return Response.json({ error: 'KUDISMS_API_TOKEN not configured' }, { status: 500 });
    }

    // Normalize to 234XXXXXXXXXX (13 digits)
    let formattedPhone = phone.toString().replace(/\D/g, "");
    if (formattedPhone.startsWith("234") && formattedPhone.length === 13) {
      // already correct
    } else if (formattedPhone.startsWith("0") && formattedPhone.length === 11) {
      formattedPhone = "234" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("234")) {
      formattedPhone = "234" + formattedPhone;
    }

    console.log(`Sending SMS to: ${formattedPhone}, senderID: ${senderID}`);

    // Use GET with query params (confirmed working per KudiSMS docs)
    const url = `https://my.kudisms.net/api/sms?token=${encodeURIComponent(token)}&senderID=${encodeURIComponent(senderID)}&recipients=${encodeURIComponent(formattedPhone)}&message=${encodeURIComponent(messageBody)}&gateway=2`;

    const response = await fetch(url);
    const text = await response.text();
    console.log(`KudiSMS response: ${text}`);

    let result;
    try { result = JSON.parse(text); } catch { result = { raw: text }; }

    if (result.status === "error") {
      return Response.json({ error: result.msg || "SMS provider error", details: result }, { status: 500 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    console.error(`sendSMS error: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
});