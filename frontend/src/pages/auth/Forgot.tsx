//src/pages/auth/Forgot.tsx
import { useState } from 'react';
import { Alert, Stack, TextField, Typography, Link } from '@mui/material';
import { AuthAPI } from '../../services/api';
import { Link as RouterLink } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import LoadingButton from '../../components/LoadingButton';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function ForgotPage(){
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string|undefined>();
  const [loading, setLoading] = useState(false);

  async function onSend(){
    setMsg(undefined);
    if (!isEmail(email)) { setMsg('Please enter a valid email'); return; }
    setLoading(true);
    try { await AuthAPI.forgot(email); setMsg('Reset code sent. Check your email.'); }
    catch(e:any){ setMsg(e?.response?.data?.message || e.message || 'Request failed'); }
    finally { setLoading(false); }
  }

  return (
    <AuthLayout title="Forgot password" subtitle="We'll email you a reset code.">
      <Stack spacing={2}>
        {msg && <Alert severity={msg.includes('sent')?'success':'error'}>{msg}</Alert>}
        <TextField label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} fullWidth />
        <LoadingButton variant="contained" onClick={onSend} loading={loading}>Send reset code</LoadingButton>
        <Typography variant="body2">Have a code already? <Link component={RouterLink} to="/reset">Reset here</Link></Typography>
      </Stack>
    </AuthLayout>
  );
}
