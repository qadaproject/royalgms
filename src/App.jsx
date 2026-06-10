import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Guests from './pages/Guests';
import Invitations from './pages/Invitations';
import Seating from './pages/Seating';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import SecurityCheckpoint from './pages/SecurityCheckpoint';
import RSVPPortal from './pages/RSVPPortal';
import EventSettings from './pages/EventSettings';
import InvitationManager from './pages/InvitationManager';
import InviteDetail from './pages/InviteDetail';
import CheckInScanner from './pages/CheckInScanner';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ItineraryPage from './pages/ItineraryPage';
import GuestUpdateLog from './pages/GuestUpdateLog';
import EventHistoryPage from './pages/EventHistoryPage';
import MarketplacePage from './pages/MarketplacePage';
import VendorDetailPage from './pages/VendorDetailPage';
import VendorRegisterPage from './pages/VendorRegisterPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import AdminMarketplace from './pages/AdminMarketplace';
import VerifyVendorEmail from './pages/VerifyVendorEmail';
import DirectoryPage from './pages/DirectoryPage';
import DirectoryListingDetail from './pages/DirectoryListingDetail';
import AdminDirectory from './pages/AdminDirectory';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/itinerary" element={<ItineraryPage />} />
      <Route path="/rsvp" element={<RSVPPortal />} />
      <Route path="/invite-detail" element={<InviteDetail />} />
      <Route path="/checkpoint" element={<SecurityCheckpoint />} />
      <Route path="/scanner" element={<CheckInScanner />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/marketplace/vendor" element={<VendorDetailPage />} />
      <Route path="/marketplace/register" element={<VendorRegisterPage />} />
      <Route path="/marketplace/vendor-dashboard" element={<VendorDashboardPage />} />
      <Route path="/marketplace/verify-email" element={<VerifyVendorEmail />} />
      <Route path="/directory" element={<DirectoryPage />} />
      <Route path="/directory/listing" element={<DirectoryListingDetail />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/invitations" element={<Invitations />} />
        <Route path="/invitation-manager" element={<InvitationManager />} />
        <Route path="/seating" element={<Seating />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<EventSettings />} />
        <Route path="/guest-update-log" element={<GuestUpdateLog />} />
        <Route path="/event-history" element={<EventHistoryPage />} />
        <Route path="/admin/marketplace" element={<AdminMarketplace />} />
        <Route path="/admin/directory" element={<AdminDirectory />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App