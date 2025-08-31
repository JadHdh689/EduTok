// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// auth pages
import LoginPage from './pages/auth/login';     // <-- use correct case
import SignUpPage from './pages/auth/SignUp';
import ConfirmPage from './pages/auth/Confirm';
import ForgotPage from './pages/auth/Forgot';
import ResetPage from './pages/auth/Reset';

// profile
import ProfilePage from './pages/profile/ProfilePage';

// placeholders for now
function FeedPage(){ return <div style={{padding:16}}>General FYP (coming next)</div>; }
function FollowingPage(){ return <div style={{padding:16}}>Following (coming next)</div>; }
function CoursesPage(){ return <div style={{padding:16}}>Courses (coming next)</div>; }

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Router is provided in main.tsx */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />

        <Route path="/login" element={<LoginPage/>} />
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/confirm" element={<ConfirmPage/>} />
        <Route path="/forgot" element={<ForgotPage/>} />
        <Route path="/reset" element={<ResetPage/>} />

        <Route element={<ProtectedRoute/>}>
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/feed" element={<FeedPage/>} />
          <Route path="/following" element={<FollowingPage/>} />
          <Route path="/courses" element={<CoursesPage/>} />
        </Route>

        <Route path="*" element={<Navigate to="/feed" replace/>} />
      </Routes>
    </ThemeProvider>
  );
}
