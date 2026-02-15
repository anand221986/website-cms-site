import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { lazy, Suspense } from "react";
const GoogleSuccess = lazy(() => import("./pages/GoogleSuccess"));
const ConnectSuccess = lazy(() => import("./pages/ConnectSuccess"));
import Index from "./pages/Index";
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const WebsiteSetting = lazy(() => import("./pages/WebSiteSetting"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Users = lazy(() => import("./pages/Users"));
const Cms = lazy(() => import("./pages/Cms"));
const Testimonial = lazy(() => import("./pages/Testimonial"));
const Blog = lazy(() => import("./pages/Blog"));
const Lead = lazy(() => import("./pages/Lead"));
const Plan=lazy(() => import("./pages/Plan"));
const Tenants = lazy(() => import("./pages/Tenants"));
const PageSectionList = lazy(() => import("./pages/PageSectionList"));
const MailSignature=lazy(() => import("./pages/MailSignature"));
const MailMerger = lazy(() => import("./pages/MailMerger"));
const UnSubscripion = lazy(() => import("./pages/UnSubscripion"));

import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <BrowserRouter basename="/ams-tools-cms">
            <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
              <Routes>

                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                <Route path="/c-m-s" element={<ProtectedRoute><Cms /></ProtectedRoute>} />
                <Route path="/testimonial" element={<ProtectedRoute><Testimonial /></ProtectedRoute>} />
                <Route path="/blogs" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
                <Route path="/leads" element={<ProtectedRoute><Lead /></ProtectedRoute>} />
                <Route path="/tenants" element={<ProtectedRoute><Tenants /></ProtectedRoute>} />
               <Route path="/plans" element={<ProtectedRoute><Plan/></ProtectedRoute>} />
                

                <Route path="/pages/:pageId/sections" element={<ProtectedRoute><PageSectionList /></ProtectedRoute>} />

                <Route
                  path="/website-setting"
                  element={
                    <ProtectedRoute>
                      <WebsiteSetting />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mail-merge"
                  element={
                    <ProtectedRoute>
                      <MailMerger />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mail-signature"
                  element={
                    <ProtectedRoute>
                      <MailSignature />
                    </ProtectedRoute>
                  }
                />

                  <Route
                  path="/unsubscripion"
                  element={
                    <ProtectedRoute>
                      <UnSubscripion />
                    </ProtectedRoute>
                  }
                />
                <Route path="/google-success" element={<GoogleSuccess />} />
                <Route path="/connect-success" element={<ConnectSuccess />} />
                

                <Route path="*" element={<NotFound />} />

              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </GoogleOAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
