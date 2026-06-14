import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import nodemailer from 'npm:nodemailer@6.9.9';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { to, subject, html, from_name } = await req.json();

    if (!to || !subject || !html) {
      return Response.json({ error: 'to, subject, and html are required' }, { status: 400 });
    }

    const host = Deno.env.get("SMTP_HOST");
    const port = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const user = Deno.env.get("SMTP_USER");
    const pass = Deno.env.get("SMTP_PASS");

    if (!host || !user || !pass) {
      return Response.json({ error: 'SMTP_HOST, SMTP_USER, and SMTP_PASS secrets must be set.' }, { status: 400 });
    }

    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }, // allow self-signed certs common on cPanel
    });

    const senderName = from_name
      ? from_name.replace(/[—–\-|]/g, "").replace(/\s+/g, " ").trim()
      : "Royal Protocol Office";

    const info = await transporter.sendMail({
      from: `"${senderName}" <${user}>`,
      to,
      subject,
      html,
    });

    return Response.json({ success: true, messageId: info.messageId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});