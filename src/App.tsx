import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import Courses from "./pages/Courses";
import Products from "./pages/Products";
import Affiliates from "./pages/Affiliates";
import TalentMarket from "./pages/TalentMarket";
import Campaigns from "./pages/Campaigns";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Tutors from "./pages/Tutors";
import Institutions from "./pages/Institutions";
import InstitutionPortal from "./pages/InstitutionPortal";

// User Dashboard
import Dashboard from "./pages/Dashboard";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardCourses from "./pages/dashboard/DashboardCourses";
import DashboardProducts from "./pages/dashboard/DashboardProducts";
import DashboardTalent from "./pages/dashboard/DashboardTalent";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import DashboardScholarship from "./pages/dashboard/DashboardScholarship";
import Scholarship from "./pages/Scholarship";

// Admin pages
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminTalents from "./pages/admin/AdminTalents";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminScholarships from "./pages/admin/AdminScholarships";
import AdminScholarshipTasks from "./pages/admin/AdminScholarshipTasks";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/products" element={<Products />} />
            <Route path="/affiliates" element={<Affiliates />} />
            <Route path="/talent" element={<TalentMarket />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/scholarship/:programId" element={<Scholarship />} />
            <Route path="/tutors" element={<Tutors />} />
            <Route path="/institutions" element={<Institutions />} />
            <Route path="/institutions/:slug" element={<InstitutionPortal />} />

            {/* User Dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="scholarship" element={<DashboardScholarship />} />
              <Route path="courses" element={<DashboardCourses />} />
              <Route path="products" element={<DashboardProducts />} />
              <Route path="talent" element={<DashboardTalent />} />
              <Route path="settings" element={<DashboardSettings />} />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireModerator>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="talents" element={<AdminTalents />} />
              <Route path="campaigns" element={<AdminCampaigns />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route
                path="scholarships"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminScholarships />
                  </ProtectedRoute>
                }
              />
              <Route
                path="scholarships/tasks"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminScholarshipTasks />
                  </ProtectedRoute>
                }
              />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
