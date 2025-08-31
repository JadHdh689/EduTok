import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// auth pages
import LoginPage from './pages/auth/login';
import SignUpPage from './pages/auth/SignUp';
import ConfirmPage from './pages/auth/Confirm';
import ForgotPage from './pages/auth/Forgot';
import ResetPage from './pages/auth/Reset';

// profile & feed pages
import ProfilePage from './pages/profile/ProfilePage';
import FypPage from './pages/fyp/FypPage';

// courses (authoring/management)
import MyCoursesList from './components/profile/MyCoursesList';
import CourseBuilder from './components/courses/CourseBuilder';

// courses (public browse + detail)
import CoursesBrowse from './pages/courses/CoursesBrowse';
import CoursePublicPage from './pages/courses/CoursePublicPage';

// NEW: section page to keep users inside the course flow
import SectionPage from './pages/courses/SectionPage';

// simple placeholder
function FollowingPage() {
  return <div style={{ padding: 16 }}>Following (coming next)</div>;
}

// Wrapper to pass :id from route to CourseBuilder (authoring edit)
function CourseBuilderWithParam() {
  const { id } = useParams();
  return <CourseBuilder courseId={id} />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      {/* Single Suspense boundary to cover any lazy children down the tree */}
      <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
        <Routes>
          {/* default → feed */}
          <Route path="/" element={<Navigate to="/feed" replace />} />

          {/* auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route path="/forgot" element={<ForgotPage />} />
          <Route path="/reset" element={<ResetPage />} />

          {/* protected app */}
          <Route element={<ProtectedRoute />}>
            {/* core */}
            <Route path="/feed" element={<FypPage />} />
            <Route path="/following" element={<FollowingPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* ===== Courses: public/discovery ===== */}
            <Route path="/courses" element={<CoursesBrowse />} />
            <Route path="/courses/:id" element={<CoursePublicPage />} />

            {/* >>> This keeps the learner INSIDE the course (no feed fallback) <<< */}
            <Route path="/courses/:id/sections/:sectionId" element={<SectionPage />} />

            {/* ===== Profile → Courses authoring/management ===== */}
            <Route path="/profile/courses" element={<MyCoursesList />} />
            <Route path="/profile/courses/new" element={<CourseBuilder />} />
            <Route path="/profile/courses/:id/edit" element={<CourseBuilderWithParam />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}
