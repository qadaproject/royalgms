Deno.serve(async (req) => {
  try {
    const { phone, text } = await req.json();

    if (!phone || !text) {
      return Response.json({ error: 'phone and text are required' }, { status: 400 });
    }

    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const appSecret = Deno.env.get("WHATSAPP_APP_SECRET");

    if (!accessToken || !phoneNumberId || !appSecret) {
      return Response.json({ error: 'WhatsApp secrets not configured.' }, { status: 400 });
    }

    // appsecret_proof: HMAC-SHA256(access_token, app_secret)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(appSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(accessToken));
    const appsecretProof = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

    // Normalize recipient phone to E.164
    let recipient = phone.toString().replace(/\D/g, "");
    if (recipient.startsWith("00")) recipient = recipient.slice(2);
    if (recipient.startsWith("0")) {
      recipient = "234" + recipient.slice(1);
    } else if (recipient.startsWith("234")) {
      // already has country code
    } else if (recipient.length === 10 && /^[789]/.test(recipient)) {
      recipient = "234" + recipient;
    }

    const payload = {
      messaging_product: "whatsapp",
      to: recipient,
      type: "text",
      text: { body: text },
    };

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages?appsecret_proof=${appsecretProof}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return Response.json({ error: result.error?.message || "Meta WhatsApp API error", details: result }, { status: 500 });
    }

    const waId = result.messages?.[0]?.id || "";
    const messageStatus = result.messages?.[0]?.message_status || "unknown";
    return Response.json({ success: true, result, wa_message_id: waId, message_status: messageStatus, recipient });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});