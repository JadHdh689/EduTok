//src/pages/auth/Confirm.tsx
import { useState } from 'react';
import { Alert, Stack, TextField, Typography, Link } from '@mui/material';
import { AuthAPI } from '../../services/api';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import LoadingButton from '../../components/LoadingButton';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function ConfirmPage(){
  const [sp] = useSearchParams();
  const [email, setEmail] = useState(sp.get('u') || '');
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string|undefined>();
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onConfirm(){
    setErr(undefined);
    if (!isEmail(email)) { setErr('Please enter a valid email'); return; }
    if (!code.trim()) { setErr('Enter the confirmation code'); return; }
    setLoading(true);
    try { await AuthAPI.confirm(email, code); nav('/login'); }
    catch(e:any){ setErr(e?.response?.data?.message || e.message || 'Confirm failed'); }
    finally { setLoading(false); }
  }

  async function onResend(){
    setErr(undefined);
    if (!isEmail(email)) { setErr('Please enter a valid email'); return; }
    try { await AuthAPI.resend(email); }
    catch(e:any){ setErr(e?.response?.data?.message || e.message || 'Resend failed'); }
  }

  return (
    <AuthLayout title="Confirm your email" subtitle="Enter the 6-digit code we sent to your email.">
      <Stack spacing={2}>
        {err && <Alert severity="error">{err}</Alert>}
        <TextField label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} fullWidth />
        <TextField label="Confirmation code" value={code} onChange={(e)=>setCode(e.target.value)} fullWidth />
        <Stack direction="row" spacing={1}>
          <LoadingButton variant="contained" onClick={onConfirm} loading={loading}>Confirm</LoadingButton>
          <LoadingButton variant="outlined" onClick={onResend}>Resend code</LoadingButton>
        </Stack>
        <Typography variant="body2"><Link component={RouterLink} to="/login">Back to login</Link></Typography>
      </Stack>
    </AuthLayout>
  );
}
