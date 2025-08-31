// src/components/Navbar.tsx
import * as React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hook';
import { selectIsAuthed } from '../features/auth/selectors';
import { signOutThunk } from '../features/auth/authSlice';
import { tokenStore } from '../services/api';

function decodeName(): string {
  const id = tokenStore.load()?.idToken;
  if (!id) return '';
  try {
    const payload = JSON.parse(atob(id.split('.')[1]));
    return payload.preferred_username || payload.email || '';
  } catch { return ''; }
}

export default function Navbar() {
  const isAuthed = useAppSelector(selectIsAuthed);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  const [anchorNav, setAnchorNav] = React.useState<null | HTMLElement>(null);
  const [anchorUser, setAnchorUser] = React.useState<null | HTMLElement>(null);

  const name = decodeName();

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        <IconButton size="large" edge="start" color="inherit" onClick={(e)=>setAnchorNav(e.currentTarget)} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorNav}
          open={!!anchorNav}
          onClose={()=>setAnchorNav(null)}
        >
          <MenuItem component={RouterLink} to="/feed" onClick={()=>setAnchorNav(null)}>General FYP</MenuItem>
          <MenuItem component={RouterLink} to="/following" onClick={()=>setAnchorNav(null)}>Following</MenuItem>
          <MenuItem component={RouterLink} to="/courses" onClick={()=>setAnchorNav(null)}>Courses</MenuItem>
        </Menu>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          EduTok
        </Typography>

        {!isAuthed ? (
          <Box>
            <Button color="inherit" component={RouterLink} to="/login">Login</Button>
            <Button color="inherit" component={RouterLink} to="/signup">Sign Up</Button>
          </Box>
        ) : (
          <Box>
            <IconButton size="large" color="inherit" onClick={(e)=>setAnchorUser(e.currentTarget)}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorUser}
              open={!!anchorUser}
              onClose={()=>setAnchorUser(null)}
            >
              <MenuItem disabled>{name || 'Account'}</MenuItem>
              <MenuItem component={RouterLink} to="/profile" onClick={()=>setAnchorUser(null)}>Profile</MenuItem>
              <MenuItem onClick={async ()=>{ setAnchorUser(null); await dispatch(signOutThunk()); nav('/login'); }}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
