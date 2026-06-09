// Meta WhatsApp Business API
// Template: invitation_notices
// Variables: {{1}} = name, {{2}} = link
// WABA ID: 115025707150672
// Phone Number ID must be set as WHATSAPP_PHONE_NUMBER_ID secret
// Access Token must be set as WHATSAPP_ACCESS_TOKEN secret

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

    // Generate appsecret_proof (HMAC-SHA256 of access token using app secret)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(appSecret);
    const messageData = encoder.encode(accessToken);
    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const appsecretProof = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    // Format phone: ensure it starts with 234 (Nigeria), no + prefix for Meta API
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "234" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("234")) {
      formattedPhone = "234" + formattedPhone;
    }

    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "invitation_notices",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: name },
              { type: "text", text: link },
            ],
          },
        ],
      },
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages?appsecret_proof=${appsecretProof}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      return Response.json({ error: result.error?.message || "WhatsApp API error", details: result }, { status: 500 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});