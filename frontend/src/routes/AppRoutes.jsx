import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import VerifyResetOTP from '../pages/VerifyResetOTP';
import ResetPassword from '../pages/ResetPassword';

// Host Components
import HostLayout from '../components/host/HostLayout';
import HostDashboard from '../pages/host/HostDashboard';
import HostListings from '../pages/host/HostListings';
import CreateListing from '../pages/host/CreateListing';
import EditListing from '../pages/host/EditListing';
import HostBookings from '../pages/host/HostBookings';
import HostEarnings from '../pages/host/HostEarnings';
import HostReviews from '../pages/host/HostReviews';
import HostProfile from '../pages/host/HostProfile';
import HostSettings from '../pages/host/HostSettings';

// Guest Components
import GuestLayout from '../components/guest/GuestLayout';
import Explore from '../pages/guest/Explore';
import Search from '../pages/guest/Search';
import PropertyDetails from '../pages/guest/PropertyDetails';
import BookingSuccess from '../pages/guest/BookingSuccess';
import Trips from '../pages/guest/Trips';
import Wishlist from '../pages/guest/Wishlist';
import Reviews from '../pages/guest/Reviews';
import GuestProfile from '../pages/guest/GuestProfile';
import GuestSettings from '../pages/guest/GuestSettings';

// Shared Components
import Messages from '../pages/Messages';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes - Guests Only */}
      <Route element={<ProtectedRoute allowedRoles={['guest']} />}>
        <Route element={<GuestLayout />}>
          <Route path="/guest" element={<Explore />} />
          <Route path="/search" element={<Search />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/bookings/:id/success" element={<BookingSuccess />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/profile" element={<GuestProfile />} />
          <Route path="/settings" element={<GuestSettings />} />
        </Route>
      </Route>

      {/* Protected Routes - Hosts Only */}
      <Route element={<ProtectedRoute allowedRoles={['host']} />}>
        <Route element={<HostLayout />}>
          <Route path="/host" element={<Navigate to="/host/dashboard" replace />} />
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/listings" element={<HostListings />} />
          <Route path="/host/listings/create" element={<CreateListing />} />
          <Route path="/host/listings/:listingId/edit" element={<EditListing />} />
          <Route path="/host/bookings" element={<HostBookings />} />
          <Route path="/host/messages" element={<Messages />} />
          <Route path="/host/messages/:conversationId" element={<Messages />} />
          <Route path="/host/earnings" element={<HostEarnings />} />
          <Route path="/host/reviews" element={<HostReviews />} />
          <Route path="/host/profile" element={<HostProfile />} />
          <Route path="/host/settings" element={<HostSettings />} />
        </Route>
      </Route>

      {/* Catch all 404 */}
      <Route path="*" element={<div className="p-8 text-center text-2xl mt-10">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
