import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, html, from_name } = await req.json();

    if (!to || !subject || !html) {
      return Response.json({ error: 'to, subject, and html are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");

    if (!apiKey) {
      return Response.json({ error: 'RESEND_API_KEY secret must be set.' }, { status: 400 });
    }

    const fromEmail = "no-reply@royalgms.com";
    const fromField = from_name ? `${from_name} <${fromEmail}>` : fromEmail;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromField,
        to: [to],
        subject,
        html,
      }),
    });

    const result = await response.json();

    if (!response.ok || result.statusCode >= 400) {
      return Response.json({ error: result.message || "Resend API error", details: result }, { status: 500 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});