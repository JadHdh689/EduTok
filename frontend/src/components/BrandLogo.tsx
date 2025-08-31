// FILE: src/components/BrandLogo.tsx
import { Typography } from '@mui/material';


export default function BrandLogo({ size = 28 }: { size?: number }){
return (
<Typography
sx={{
fontWeight: 800,
background: 'linear-gradient(90deg,#6C5CE7,#00C4B3)',
WebkitBackgroundClip: 'text',
color: 'transparent',
fontSize: size,
}}
>
EduTok
</Typography>
);
}