import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PRICE_MAP = { 0: "₦", 1: "₦", 2: "₦₦", 3: "₦₦₦", 4: "₦₦₦₦" };

const SEARCH_QUERIES = [
  { query: "Hotels in Warri", category: "Hotel" },
  { query: "Restaurants in Warri", category: "Restaurant" },
  { query: "Hospitals in Warri", category: "Hospital" },
  { query: "Banks in Warri", category: "Bank" },
  { query: "Supermarkets in Warri", category: "Supermarket" },
  { query: "Petrol stations in Warri", category: "Petrol Station" },
  { query: "Pharmacies in Warri", category: "Pharmacy" },
  { query: "Schools in Warri", category: "School" },
  { query: "Lounges and bars in Warri", category: "Lounge & Bar" },
  { query: "Shopping malls in Warri", category: "Shopping Mall" },
  { query: "Police stations in Warri", category: "Police Station" },
  { query: "Churches in Warri", category: "Church" },
  { query: "Mosques in Warri", category: "Mosque" },
  { query: "Apartments and lodges in Warri", category: "Apartment & Lodge" },
  { query: "Clinics in Warri", category: "Clinic" },
  { query: "Car dealers in Warri", category: "Car Dealer" },
  { query: "Event centers in Warri", category: "Event Center" },
  { query: "Gyms and fitness centers in Warri", category: "Gym" },
  { query: "Salons and spas in Warri", category: "Salon & Spa" },
  { query: "Markets in Warri", category: "Market" },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) return Response.json({ error: "Missing GOOGLE_MAPS_API_KEY" }, { status: 500 });

    // Get existing place IDs to avoid duplicates
    const existing = await base44.asServiceRole.entities.DirectoryListing.list();
    const existingPlaceIds = new Set(existing.map(l => l.google_place_id).filter(Boolean));
    const existingNames = new Set(existing.map(l => l.name?.toLowerCase()).filter(Boolean));

    let totalImported = 0;
    let totalSkipped = 0;
    const results = [];

    for (const { query, category } of SEARCH_QUERIES) {
      // Search Google Maps
      const searchUrl = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
      searchUrl.searchParams.set("query", query);
      searchUrl.searchParams.set("location", "5.5167,5.7500");
      searchUrl.searchParams.set("radius", "20000");
      searchUrl.searchParams.set("key", apiKey);

      const searchResp = await fetch(searchUrl.toString());
      const searchData = await searchResp.json();
      const places = searchData.results || [];

      let categoryImported = 0;
      for (const p of places.slice(0, 15)) {
        // Skip duplicates
        if (existingPlaceIds.has(p.place_id)) { totalSkipped++; continue; }
        if (existingNames.has(p.name?.toLowerCase())) { totalSkipped++; continue; }

        const photoUrl = p.photos?.[0]?.photo_reference
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${p.photos[0].photo_reference}&key=${apiKey}`
          : null;

        await base44.asServiceRole.entities.DirectoryListing.create({
          name: p.name,
          category: category,
          address: p.formatted_address,
          latitude: p.geometry?.location?.lat || null,
          longitude: p.geometry?.location?.lng || null,
          rating: p.rating || 0,
          review_count: p.user_ratings_total || 0,
          price_range: PRICE_MAP[p.price_level] || null,
          photo_url: photoUrl,
          google_place_id: p.place_id,
          city: "Warri",
          state: "Delta State",
          status: "active",
          source: "google",
        });

        existingPlaceIds.add(p.place_id);
        existingNames.add(p.name?.toLowerCase());
        totalImported++;
        categoryImported++;
      }

      results.push({ category, found: places.length, imported: categoryImported });

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
    }

    return Response.json({
      success: true,
      total_imported: totalImported,
      total_skipped: totalSkipped,
      breakdown: results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});