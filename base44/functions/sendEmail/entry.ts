import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { to, subject, html, from_name } = await req.json();

    if (!to || !subject || !html) {
      return Response.json({ error: 'to, subject, and html are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) {
      return Response.json({ error: 'BREVO_API_KEY secret must be set.' }, { status: 400 });
    }

    const fromEmail = Deno.env.get("SMTP_USER") || "noreply@atuwatseiii.com";
    const senderName = from_name || "Royal Protocol Office";

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ success: true, messageId: data.messageId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});