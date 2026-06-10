import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) return Response.json({ error: "No API key" }, { status: 500 });

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=hotels+in+Warri+Nigeria&key=${apiKey}`;
    const resp = await fetch(url);
    const data = await resp.json();

    return Response.json({ status: data.status, error_message: data.error_message, count: data.results?.length, first: data.results?.[0] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});