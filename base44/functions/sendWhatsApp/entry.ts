Deno.serve(async (req) => {
  try {
    const { phone, name, qr_code, template } = await req.json();

    if (!phone || !name || !qr_code) {
      return Response.json({ error: 'phone, name, and qr_code are required' }, { status: 400 });
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

    // Format phone: handle Nigerian and international numbers correctly
    let recipient = phone.toString().replace(/\D/g, "");
    let isInternational = false;

    // Strip international dialing prefix "00"
    if (recipient.startsWith("00")) {
      recipient = recipient.slice(2);
    }

    if (recipient.startsWith("0")) {
      // Nigerian local number with leading 0 (e.g. 08012345678)
      recipient = "234" + recipient.slice(1);
    } else if (recipient.startsWith("234")) {
      // Nigerian number already has country code — keep as-is
    } else if (recipient.length === 10 && /^[789]/.test(recipient)) {
      // Nigerian mobile without leading 0 (e.g. 8012345678)
      recipient = "234" + recipient;
    } else {
      // International number with its own country code (e.g. 447911..., 1415555..., 97150...)
      isInternational = true;
    }

    const templateName = template || "notice";
    const HEADER_IMAGE_URL = "https://media.base44.com/images/public/69f83e971133ed44e3fc81f6/97538d805_ogiame2.jpg";

    // Fetch the approved template's structure from Meta so the components we
    // send match the template definition exactly (variable count, header
    // format, buttons). This lets any approved template send successfully
    // regardless of its layout — only "notice" was working before because the
    // components were hard-coded to its structure.
    let structure = null;
    try {
      const tplRes = await fetch(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/message_templates?name=${encodeURIComponent(templateName)}&appsecret_proof=${appsecretProof}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const tplData = await tplRes.json();
      structure = tplData.data?.[0] || null;
    } catch (e) {
      console.error("Template structure fetch failed: " + e.message);
    }

    const fillValues = [qr_code, name];

    const buildComponentsFromStructure = () => {
      if (!structure || !structure.components) return undefined;
      const comps = [];
      for (const comp of structure.components) {
        if (comp.type === "HEADER") {
          if (comp.format === "IMAGE") {
            comps.push({ type: "header", parameters: [{ type: "image", image: { link: HEADER_IMAGE_URL } }] });
          } else if (comp.format === "DOCUMENT") {
            comps.push({ type: "header", parameters: [{ type: "document", document: { link: HEADER_IMAGE_URL, filename: "invitation" } }] });
          } else if (comp.format === "VIDEO") {
            comps.push({ type: "header", parameters: [{ type: "video", video: { link: HEADER_IMAGE_URL } }] });
          }
        } else if (comp.type === "BODY") {
          const varCount = (comp.text?.match(/\{\{\d+\}\}/g) || []).length;
          if (varCount > 0) {
            const params = [];
            for (let i = 0; i < varCount; i++) {
              params.push({ type: "text", text: fillValues[i] ?? "" });
            }
            comps.push({ type: "body", parameters: params });
          }
        }
      }
      // URL buttons — fill each URL variable with the admission token
      for (const comp of structure.components) {
        if (comp.type === "BUTTONS") {
          (comp.buttons || []).forEach((btn, idx) => {
            if (btn.type === "URL" && /\{\{1\}\}/.test(btn.url || "")) {
              comps.push({ type: "button", sub_type: "url", index: idx, parameters: [{ type: "text", text: qr_code }] });
            }
          });
        }
      }
      return comps.length ? comps : undefined;
    };

    const comps = buildComponentsFromStructure();
    const templatePayload = {
      name: templateName,
      language: { code: structure?.language || "en" },
      ...(comps ? { components: comps } : {}),
    };

    const payload = {
      messaging_product: "whatsapp",
      to: recipient,
      type: "template",
      template: templatePayload,
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

    const messageStatus = result.messages?.[0]?.message_status || "unknown";
    return Response.json({ success: true, result, is_international: isInternational, recipient, message_status: messageStatus });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});