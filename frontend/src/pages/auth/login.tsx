//src/pages/auth/login.tsx
import { useEffect, useState } from 'react';
import { Alert, Stack, TextField, Typography, Link } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { signInThunk } from '../../features/auth/authSlice';
import { selectAuth, selectIsAuthed } from '../../features/auth/selectors';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import LoadingButton from '../../components/LoadingButton';
import PasswordField from '../../components/PasswordField';

type LocState = { from?: string };

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(selectAuth);
  const isAuthed = useAppSelector(selectIsAuthed);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localErr, setLocalErr] = useState<string>();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as LocState | undefined)?.from || '/feed';

  // If already authed and we somehow hit /login, bounce immediately
  useEffect(() => {
    if (isAuthed) nav(from, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  async function onSubmit() {
    setLocalErr(undefined);
    if (!isEmail(email)) {
      setLocalErr('Please enter a valid email address.');
      return;
    }
    try {
      // unwrap throws on reject so we hit catch reliably
      await dispatch(signInThunk({ username: email, password })).unwrap();
      nav(from, { replace: true });
    } catch (e: any) {
      setLocalErr(e?.message || 'Login failed');
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in with your email and password.">
      <Stack spacing={2}>
        {(error || localErr) && <Alert severity="error">{localErr || error}</Alert>}
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
          Sign In
        </LoadingButton>
        <Typography variant="body2">
          <Link component={RouterLink} to="/forgot">Forgot password?</Link>
        </Typography>
        <Typography variant="body2">
          Don&apos;t have an account? <Link component={RouterLink} to="/signup">Sign up</Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
