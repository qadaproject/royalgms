import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('[v0] Supabase Config:', {
  url: Boolean(supabaseUrl),
  key: Boolean(supabaseAnonKey),
  urlPrefix: supabaseUrl?.substring(0, 20),
});

// Initialize Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (supabase) {
  console.log('[v0] Supabase client initialized successfully');
}

// =====================================
// GUEST SERVICE
// =====================================
export const guestService = {
  // Fetch all guests
  async fetchGuests(filters = {}) {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }
      let query = supabase.from('guests').select('*');
      
      if (filters.category && filters.category !== 'All Categories') {
        query = query.eq('category', filters.category);
      }
      if (filters.status && filters.status !== 'All Status') {
        query = query.eq('rsvp_status', filters.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('[v0] Fetch guests error:', error);
        return { data: null, error };
      }
      
      console.log('[v0] Fetched guests:', data?.length || 0);
      return { data: data || [], error: null };
    } catch (err) {
      console.error('[v0] Fetch guests exception:', err);
      return { data: null, error: err };
    }
  },

  // Create a new guest
  async createGuest(guestData) {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }
      
      console.log('[v0] Creating guest:', guestData.full_name);
      
      const { data, error } = await supabase
        .from('guests')
        .insert([guestData])
        .select();
      
      if (error) {
        console.error('[v0] Create guest error:', error);
        return { data: null, error };
      }
      
      console.log('[v0] Guest created successfully:', data?.[0]?.id);
      return { data: data?.[0], error: null };
    } catch (err) {
      console.error('[v0] Create guest exception:', err);
      return { data: null, error: err };
    }
  },

  // Update a guest
  async updateGuest(guestId, updates) {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await supabase
        .from('guests')
        .update(updates)
        .eq('id', guestId)
        .select();

      if (error) {
        console.error('[v0] Update guest error:', error);
        return { data: null, error };
      }

      console.log('[v0] Guest updated successfully:', guestId);
      return { data: data?.[0], error: null };
    } catch (err) {
      console.error('[v0] Update guest exception:', err);
      return { data: null, error: err };
    }
  },

  // Delete a guest
  async deleteGuest(guestId) {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guestId);

      if (error) {
        console.error('[v0] Delete guest error:', error);
        return { data: null, error };
      }

      console.log('[v0] Guest deleted successfully:', guestId);
      return { data: { deleted: true }, error: null };
    } catch (err) {
      console.error('[v0] Delete guest exception:', err);
      return { data: null, error: err };
    }
  },

  // Bulk create guests
  async bulkCreateGuests(guestRows) {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await supabase
        .from('guests')
        .insert(guestRows)
        .select();

      if (error) {
        console.error('[v0] Bulk create error:', error);
        return { data: null, error };
      }

      console.log('[v0] Bulk created guests:', data?.length || 0);
      return { data: data || [], error: null };
    } catch (err) {
      console.error('[v0] Bulk create exception:', err);
      return { data: null, error: err };
    }
  },

  // Log activity
  async logActivity(guestId, guestName, eventType, description, oldValue, newValue) {
    try {
      if (!supabase) {
        console.warn('[v0] Activity logging skipped - Supabase not initialized');
        return;
      }

      await supabase.from('guest_activity_log').insert([{
        guest_id: guestId,
        guest_name: guestName,
        event_type: eventType,
        description,
        old_value: oldValue,
        new_value: newValue,
        created_at: new Date().toISOString(),
      }]);
    } catch (err) {
      console.warn('[v0] Activity logging failed:', err.message);
    }
  },

  // Fetch guest by RSVP token
  async fetchGuestByRsvpToken(token) {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .or(`rsvp_token.eq.${token},qr_code.eq.${token}`)
        .limit(1);

      if (error) {
        console.error('[v0] Fetch guest by token error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('[v0] Fetch guest by token exception:', err);
      return { data: null, error: err };
    }
  },
};

// =====================================
// INVITATION SERVICE
// =====================================
export const invitationService = {
  async fetchInvitations(filters = {}) {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }
      
      let query = supabase.from('invitations').select('*');

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('[v0] Fetch invitations error:', error);
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.error('[v0] Fetch invitations exception:', err);
      return { data: null, error: err };
    }
  },

  async createInvitation(invitationData) {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await supabase
        .from('invitations')
        .insert([invitationData])
        .select();

      if (error) {
        console.error('[v0] Create invitation error:', error);
        return { data: null, error };
      }

      return { data: data?.[0], error: null };
    } catch (err) {
      console.error('[v0] Create invitation exception:', err);
      return { data: null, error: err };
    }
  },

  async updateInvitation(invitationId, updates) {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await supabase
        .from('invitations')
        .update(updates)
        .eq('id', invitationId)
        .select();

      if (error) {
        console.error('[v0] Update invitation error:', error);
        return { data: null, error };
      }

      return { data: data?.[0], error: null };
    } catch (err) {
      console.error('[v0] Update invitation exception:', err);
      return { data: null, error: err };
    }
  },
};

// =====================================
// SEATING SERVICE
// =====================================
export const seatingService = {
  async fetchSeatingZones() {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await supabase
        .from('seating_zones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[v0] Fetch seating zones error:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('[v0] Fetch seating zones exception:', err);
      return { data: null, error: err };
    }
  },

  async createSeatingZone(zoneData) {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await supabase
        .from('seating_zones')
        .insert([zoneData])
        .select();

      if (error) {
        console.error('[v0] Create seating zone error:', error);
        return { data: null, error };
      }

      return { data: data?.[0], error: null };
    } catch (err) {
      console.error('[v0] Create seating zone exception:', err);
      return { data: null, error: err };
    }
  },

  async updateSeatingZone(zoneId, updates) {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await supabase
        .from('seating_zones')
        .update(updates)
        .eq('id', zoneId)
        .select();

      if (error) {
        console.error('[v0] Update seating zone error:', error);
        return { data: null, error };
      }

      return { data: data?.[0], error: null };
    } catch (err) {
      console.error('[v0] Update seating zone exception:', err);
      return { data: null, error: err };
    }
  },
};
