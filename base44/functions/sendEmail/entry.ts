import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { to, subject, html, from_name } = await req.json();

    if (!to || !subject || !html) {
      return Response.json({ error: 'to, subject, and html are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL"); // reuse existing sender email secret

    if (!apiKey || !fromEmail) {
      return Response.json({ error: 'BREVO_API_KEY and RESEND_FROM_EMAIL secrets must be set.' }, { status: 400 });
    }

    const safeName = from_name
      ? from_name.replace(/[—–\-|]/g, "").replace(/\s+/g, " ").trim()
      : "Royal Protocol Office";

    // Generate plain-text fallback by stripping HTML tags
    const text = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, "\n")
      .trim();

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: safeName, email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return Response.json({ error: result.message || "Brevo API error", details: result }, { status: 500 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});