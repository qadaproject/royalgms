import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const { place_id } = await req.json();
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) return Response.json({ error: "Missing API key" }, { status: 500 });
    if (!place_id) return Response.json({ error: "place_id required" }, { status: 400 });

    const fields = "name,formatted_address,formatted_phone_number,website,opening_hours,photos,rating,user_ratings_total,price_level,geometry,types,editorial_summary,url";
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=${fields}&key=${apiKey}`;

    const resp = await fetch(url);
    const data = await resp.json();

    if (data.status !== "OK") {
      return Response.json({ error: data.error_message || data.status }, { status: 400 });
    }

    const r = data.result;
    const photos = (r.photos || []).slice(0, 6).map(p =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${apiKey}`
    );

    return Response.json({
      place: {
        google_place_id: place_id,
        name: r.name,
        address: r.formatted_address,
        phone: r.formatted_phone_number,
        website: r.website,
        opening_hours: r.opening_hours?.weekday_text?.join(" | ") || null,
        open_now: r.opening_hours?.open_now,
        rating: r.rating,
        review_count: r.user_ratings_total,
        price_level: r.price_level,
        latitude: r.geometry?.location?.lat,
        longitude: r.geometry?.location?.lng,
        photo_url: photos[0] || null,
        gallery_urls: photos,
        types: r.types,
        description: r.editorial_summary?.overview || null,
        maps_url: r.url,
        source: "google",
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});