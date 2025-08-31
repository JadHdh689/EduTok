// FILE: src/pages/auth/Reset.tsx
import { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography, Link } from '@mui/material';
import { AuthAPI } from '../../services/api';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';


export default function ResetPage(){
const [email, setEmail] = useState('');
const [code, setCode] = useState('');
const [password, setPassword] = useState('');
const [msg, setMsg] = useState<string|undefined>();
const nav = useNavigate();


async function onReset(){
setMsg(undefined);
try { await AuthAPI.reset(email, code, password); setMsg('Password updated. You can sign in now.'); setTimeout(()=>nav('/login'), 800); }
catch(e:any){ setMsg(e?.response?.data?.message || e.message || 'Reset failed'); }
}


return (
<AuthLayout title="Reset password" subtitle="Enter your code and a new password.">
<Stack spacing={2}>
{msg && <Alert severity={msg.includes('updated')?'success':'error'}>{msg}</Alert>}
<TextField label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} fullWidth />
<TextField label="Reset code" value={code} onChange={(e)=>setCode(e.target.value)} fullWidth />
<TextField label="New password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} fullWidth />
<Button variant="contained" onClick={onReset}>Reset password</Button>
<Typography variant="body2"><Link component={RouterLink} to="/login">Back to login</Link></Typography>
</Stack>
</AuthLayout>
);
}