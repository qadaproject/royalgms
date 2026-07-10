import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MARKETPLACE_EMAIL = "marketplace@royalgms.com";
const MARKETPLACE_NAME = "Royal Marketplace";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { vendor_id, commenter_name, comment_content, product_name } = await req.json();

    if (!vendor_id) return Response.json({ error: "vendor_id required" }, { status: 400 });

    const vendors = await base44.asServiceRole.entities.Vendor.filter({ id: vendor_id });
    if (!vendors.length) return Response.json({ error: "Vendor not found" }, { status: 404 });
    const vendor = vendors[0];

    if (!vendor.email) return Response.json({ success: true, skipped: "no vendor email" });

    const subject = product_name
      ? `New comment on your product "${product_name}" — Royal Marketplace`
      : `New comment on your listing — Royal Marketplace`;

    const context = product_name ? `your product/service <strong>${product_name}</strong>` : `your business listing <strong>${vendor.business_name}</strong>`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#7a1a1a;padding:24px;text-align:center;">
          <h1 style="color:#f5d78e;font-size:22px;margin:0;">Royal Marketplace</h1>
          <p style="color:#f5d78e;opacity:0.8;margin:4px 0 0;">Warri Kingdom</p>
        </div>
        <div style="padding:32px 24px;background:#fff;">
          <h2 style="color:#1a1a1a;font-size:18px;">💬 New Comment</h2>
          <p style="color:#555;">Hi <strong>${vendor.owner_full_name || vendor.business_name}</strong>,</p>
          <p style="color:#555;"><strong>${commenter_name}</strong> left a comment on ${context}:</p>
          <blockquote style="border-left:4px solid #7a1a1a;padding:12px 16px;background:#f8f4ef;margin:16px 0;color:#333;font-style:italic;">"${comment_content}"</blockquote>
          <div style="text-align:center;margin:24px 0;">
            <a href="${req.headers.get('origin') || 'https://royalgms.com'}/marketplace/vendor-dashboard" style="background:#7a1a1a;color:#f5d78e;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:bold;">Go to Dashboard to Reply</a>
          </div>
        </div>
        <div style="background:#f8f4ef;padding:16px 24px;text-align:center;">
          <p style="color:#888;font-size:12px;margin:0;">Royal Marketplace · <a href="mailto:${MARKETPLACE_EMAIL}" style="color:#7a1a1a;">${MARKETPLACE_EMAIL}</a></p>
        </div>
      </div>
    `;

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) return Response.json({ success: true, skipped: "no api key" });

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: MARKETPLACE_NAME, email: MARKETPLACE_EMAIL },
        to: [{ email: vendor.email }],
        subject,
        htmlContent: html,
      }),
    });

    return Response.json({ success: res.ok });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});