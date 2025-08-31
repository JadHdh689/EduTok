//src/components/LoadingButton.tsx
import { Button, CircularProgress } from '@mui/material';
import type {ButtonProps} from '@mui/material';


export default function LoadingButton({ loading, children, disabled, startIcon, ...rest }: ButtonProps & { loading?: boolean }){
return (
<Button
{...rest as any}
disabled={Boolean(loading) || Boolean(disabled)}
startIcon={loading ? <CircularProgress size={16} /> : startIcon}
>
{children}
</Button>
);
}