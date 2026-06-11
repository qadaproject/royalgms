Deno.serve(async (req) => {
  try {
    const { phone, name, link } = await req.json();

    if (!phone || !name || !link) {
      return Response.json({ error: 'phone, name, and link are required' }, { status: 400 });
    }

    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const appSecret = Deno.env.get("WHATSAPP_APP_SECRET");

    if (!accessToken || !phoneNumberId || !appSecret) {
      return Response.json({ error: 'WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_APP_SECRET secrets must be set.' }, { status: 400 });
    }

    // Generate appsecret_proof: HMAC-SHA256(access_token, app_secret)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(appSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(accessToken));
    const appsecretProof = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

    // Format phone: ensure it starts with country code, no +
    let recipient = phone.toString().replace(/\D/g, "");
    if (recipient.startsWith("0")) {
      recipient = "234" + recipient.slice(1);
    } else if (!recipient.startsWith("234")) {
      recipient = "234" + recipient;
    }

    const payload = {
      messaging_product: "whatsapp",
      to: recipient,
      type: "template",
      template: {
        name: "invitation_notice",
        language: { code: "en_US" }
      }
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages?appsecret_proof=${appsecretProof}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      return Response.json({ error: result.error?.message || "Meta WhatsApp API error", details: result }, { status: 500 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});