// src/pages/auth/SignUp.tsx
import { useState } from 'react';
import { Alert, Stack, TextField, Typography, Link } from '@mui/material';
import { AuthAPI, ProfileAPI } from '../../services/api';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import PasswordField from '../../components/PasswordField';
import LoadingButton from '../../components/LoadingButton';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit() {
    setErr(undefined);
    if (!isEmail(email)) {
      setErr('Please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      // Step 1: Create Cognito account
      await AuthAPI.signUp(email, password, handle || undefined);


      // Step 3: Redirect to confirm page
      nav(`/confirm?u=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Use your email as the sign-in username."
    >
      <Stack spacing={2}>
        {err && <Alert severity="error">{err}</Alert>}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setEmail(e.target.value)
          }
          fullWidth
          error={!!email && !isEmail(email)}
          helperText={!!email && !isEmail(email) ? 'Enter a valid email' : ' '}
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setPassword(e.target.value)
          }
          fullWidth
        />
        <LoadingButton variant="contained" onClick={onSubmit} loading={loading}>
          Sign Up
        </LoadingButton>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login">
            Sign in
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
