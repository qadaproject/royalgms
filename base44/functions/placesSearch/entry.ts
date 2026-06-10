import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, category, lat, lng, radius = 15000 } = await req.json();

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) return Response.json({ error: "Missing API key" }, { status: 500 });

    // Use Text Search with location bias toward Warri
    const centerLat = lat || 5.5167;
    const centerLng = lng || 5.7500;

    const searchQuery = query
      ? `${query} in Warri Delta State Nigeria`
      : `${category || "businesses"} in Warri Delta State Nigeria`;

    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", searchQuery);
    url.searchParams.set("location", `${centerLat},${centerLng}`);
    url.searchParams.set("radius", String(radius));
    url.searchParams.set("key", apiKey);

    const resp = await fetch(url.toString());
    const data = await resp.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return Response.json({ error: data.error_message || data.status }, { status: 400 });
    }

    const places = (data.results || []).map((p) => ({
      google_place_id: p.place_id,
      name: p.name,
      address: p.formatted_address,
      rating: p.rating || 0,
      review_count: p.user_ratings_total || 0,
      price_level: p.price_level,
      photo_url: p.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${apiKey}`
        : null,
      latitude: p.geometry?.location?.lat,
      longitude: p.geometry?.location?.lng,
      types: p.types || [],
      open_now: p.opening_hours?.open_now,
      source: "google",
    }));

    return Response.json({ places, total: places.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});