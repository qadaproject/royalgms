Deno.serve(async (req) => {
  try {
    const { phone, messageBody } = await req.json();

    if (!phone || !messageBody) {
      return Response.json(
        { error: "Phone and messageBody are required" },
        { status: 400 }
      );
    }

    const token = Deno.env.get("KUDISMS_API_TOKEN");
    const senderID = Deno.env.get("KUDISMS_SENDER_ID") || "OGIAME";

    if (!token) {
      return Response.json(
        { error: "KUDISMS_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Normalize phone number
    let formattedPhone = phone.toString().trim();

    // Remove spaces, brackets, dashes, and other separators
    formattedPhone = formattedPhone.replace(/[\s()-]/g, "");

    // Convert Nigerian local numbers: 08012345678 -> 2348012345678
    if (/^0\d{10}$/.test(formattedPhone)) {
      formattedPhone = "234" + formattedPhone.slice(1);
    }

    // Handle numbers starting with +
    if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.slice(1);
    }

    // Final validation: allow international E.164 without +
    if (!/^\d{8,15}$/.test(formattedPhone)) {
      return Response.json(
        {
          error:
            "Invalid phone number format. Use 08012345678, +2348012345678, +447911123456, or +12025550123"
        },
        { status: 400 }
      );
    }

    console.log(`Sending SMS to: ${formattedPhone}, senderID: ${senderID}`);

    const url =
      "https://my.kudisms.net/api/sms" +
      `?token=${encodeURIComponent(token)}` +
      `&senderID=${encodeURIComponent(senderID)}` +
      `&recipients=${encodeURIComponent(formattedPhone)}` +
      `&message=${encodeURIComponent(messageBody)}` +
      `&gateway=2`;

    const response = await fetch(url);
    const text = await response.text();

    console.log(`KudiSMS response: ${text}`);

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text };
    }

    if (result.status === "error") {
      return Response.json(
        {
          error: result.msg || "SMS provider error",
          details: result
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      result
    });
  } catch (error) {
    console.error(`sendSMS error: ${error.message}`);

    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});