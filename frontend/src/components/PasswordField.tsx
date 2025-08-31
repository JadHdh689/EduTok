// FILE: src/components/PasswordField.tsx
import { useState } from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


export default function PasswordField(props: any){
const [show, setShow] = useState(false);
return (
<TextField
{...props}
type={show ? 'text' : 'password'}
InputProps={{
endAdornment: (
<InputAdornment position="end">
<IconButton onClick={()=>setShow(s=>!s)} edge="end" size="small" aria-label="toggle password visibility">
{show ? <VisibilityOff/> : <Visibility/>}
</IconButton>
</InputAdornment>
)
}}
/>
);
}