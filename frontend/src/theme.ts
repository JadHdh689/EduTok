// FILE: src/theme.ts
import { createTheme } from '@mui/material/styles';


const theme = createTheme({
palette: {
mode: 'light',
primary: { main: '#6C5CE7' }, // electric indigo
secondary: { main: '#00C4B3' }, // teal
background: { default: '#F7F7FB', paper: '#FFFFFF' },
},
typography: {
fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
h5: { fontWeight: 700 },
button: { textTransform: 'none', fontWeight: 600 },
},
shape: { borderRadius: 14 },
components: {
MuiButton: { styleOverrides: { root: { borderRadius: 12 } } },
MuiCard: { styleOverrides: { root: { borderRadius: 16 } } },
}
});


export default theme;