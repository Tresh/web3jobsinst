import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";


import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetailPage from "./pages/courses/CourseDetailPage";
import LessonPlayerPage from "./pages/courses/LessonPlayerPage";
import Products from "./pages/Products";
import Affiliates from "./pages/Affiliates";
import TalentMarket from "./pages/TalentMarket";
import Campaigns from "./pages/Campaigns";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import WJIReferralTerms from "./pages/terms/WJIReferralTerms";
import NotFound from "./pages/NotFound";
import Changelog from "./pages/Changelog";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Tutors from "./pages/Tutors";
import Institutions from "./pages/Institutions";
import InstitutionPortal from "./pages/InstitutionPortal";
import Bootcamps from "./pages/Bootcamps";
import BootcampDetail from "./pages/BootcampDetail";
import BootcampCreate from "./pages/BootcampCreate";
import BootcampApply from "./pages/BootcampApply";
import InternshipMarket from "./pages/InternshipMarket";
import LearnFi from "./pages/LearnFi";
import LearnFiDetail from "./pages/LearnFiDetail";

// User Dashboard
import Dashboard from "./pages/Dashboard";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardCourses from "./pages/dashboard/DashboardCourses";
import DashboardProducts from "./pages/dashboard/DashboardProducts";
import DashboardTalent from "./pages/dashboard/DashboardTalent";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import DashboardScholarship from "./pages/dashboard/DashboardScholarship";
import DashboardBootcamps from "./pages/dashboard/DashboardBootcamps";
import DashboardLearnFi from "./pages/dashboard/DashboardLearnFi";
import DashboardInternship from "./pages/dashboard/DashboardInternship";
import DashboardMessages from "./pages/dashboard/DashboardMessages";
import ScholarshipModuleDetail from "./pages/dashboard/ScholarshipModuleDetail";
import Scholarship from "./pages/Scholarship";
// ScholarshipCelebration removed - no longer needed

// Admin pages
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminTalents from "./pages/admin/AdminTalents";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import AdminLearnFi from "./pages/admin/AdminLearnFi";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminScholarships from "./pages/admin/AdminScholarships";
import AdminScholarshipTasks from "./pages/admin/AdminScholarshipTasks";
import AdminBugReports from "./pages/admin/AdminBugReports";
import AdminBootcamps from "./pages/admin/AdminBootcamps";
import AdminBootcampManage from "./pages/admin/AdminBootcampManage";
import AdminTutors from "./pages/admin/AdminTutors";
import AdminUserProfile from "./pages/admin/AdminUserProfile";
import AdminChangelog from "./pages/admin/AdminChangelog";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
            <Route path="/courses/:slug" element={<CourseDetailPage />} />
            <Route path="/learn/:slug/:lessonId" element={<LessonPlayerPage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/affiliates" element={<Affiliates />} />
            <Route path="/talent" element={<TalentMarket />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/terms/wji-referral-program" element={<WJIReferralTerms />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/scholarship/:programId" element={<Scholarship />} />
            {/* Celebration route removed */}
            <Route path="/internships" element={<InternshipMarket />} />
            <Route path="/learnfi" element={<LearnFi />} />
            <Route path="/learnfi/:id" element={<LearnFiDetail />} />
            <Route path="/tutors" element={<Tutors />} />
            <Route path="/institutions" element={<Institutions />} />
            <Route path="/institutions/:slug" element={<InstitutionPortal />} />

            {/* Bootcamp routes */}
            <Route path="/bootcamps" element={<Bootcamps />} />
            <Route path="/bootcamps/:id" element={<BootcampDetail />} />
            <Route
              path="/bootcamps/:id/apply"
              element={
                <ProtectedRoute>
                  <BootcampApply />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bootcamps/create"
              element={
                <ProtectedRoute>
                  <BootcampCreate />
                </ProtectedRoute>
              }
            />
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
              <Route path="scholarship/modules/:moduleId" element={<ScholarshipModuleDetail />} />
              <Route path="bootcamps" element={<DashboardBootcamps />} />
              <Route path="internship" element={<DashboardInternship />} />
              <Route path="learnfi" element={<DashboardLearnFi />} />
              <Route path="courses" element={<DashboardCourses />} />
              <Route path="products" element={<DashboardProducts />} />
              <Route path="talent" element={<DashboardTalent />} />
              <Route path="messages" element={<DashboardMessages />} />
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
              <Route path="learnfi" element={<AdminLearnFi />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:userId" element={<AdminUserProfile />} />
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
              <Route path="bug-reports" element={<AdminBugReports />} />
              <Route path="bootcamps" element={<AdminBootcamps />} />
              <Route path="bootcamps/:id" element={<AdminBootcampManage />} />
              <Route path="tutors" element={<AdminTutors />} />
              <Route path="changelog" element={<AdminChangelog />} />
              <Route path="analytics" element={<AdminAnalytics />} />
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
