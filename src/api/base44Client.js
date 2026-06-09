// Compatibility stub for Base44 - provides no-op implementations
// The app is now using Supabase for data storage
// This stub prevents runtime errors from legacy Base44 imports

export const base44 = {
  auth: {
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => window.location.href = '/login'
  },
  entities: {
    Guest: {
      create: async () => ({}),
      filter: async () => [],
      list: async () => [],
      update: async () => ({})
    },
    EventSettings: {
      list: async () => [],
      create: async () => ({})
    },
    Invitation: {
      filter: async () => [],
      list: async () => [],
      create: async () => ({})
    },
    GuestActivityLog: {
      create: async () => ({})
    }
  }
};
