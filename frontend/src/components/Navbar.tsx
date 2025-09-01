// src/components/Navbar.tsx
import * as React from 'react';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Button,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Snackbar, Alert, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
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
  } catch {
    return '';
  }
}

export default function Navbar() {
  const isAuthed = useAppSelector(selectIsAuthed);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  // Drawers + snackbar
  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(false);
  const [userDrawerOpen, setUserDrawerOpen] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);

  const name = decodeName();

  async function handleLogout() {
    setUserDrawerOpen(false);
    try {
      await dispatch(signOutThunk());
    } finally {
      setSnackOpen(true);
      nav('/login');
    }
  }

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        {/* Left menu → Drawer */}
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          onClick={() => setLeftDrawerOpen(true)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor="left"
          open={leftDrawerOpen}
          onClose={() => setLeftDrawerOpen(false)}
        >
          <Box sx={{ width: 280 }} role="presentation">
            <List sx={{ py: 0 }}>
              <ListItem sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="EduTok" secondary="Navigation" />
              </ListItem>
              <Divider />

              <ListItemButton
                component={RouterLink}
                to="/feed"
                onClick={() => setLeftDrawerOpen(false)}
              >
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary="General FYP" />
              </ListItemButton>

              {/* Replaced 'Following' with 'People' */}
              <ListItemButton
                component={RouterLink}
                to="/people"
                onClick={() => setLeftDrawerOpen(false)}
              >
                <ListItemIcon><PersonSearchIcon /></ListItemIcon>
                <ListItemText primary="People" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/courses"
                onClick={() => setLeftDrawerOpen(false)}
              >
                <ListItemIcon><SchoolIcon /></ListItemIcon>
                <ListItemText primary="Courses" />
              </ListItemButton>
            </List>
          </Box>
        </Drawer>

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
            {/* Account → Drawer (Profile / Logout) */}
            <IconButton
              size="large"
              color="inherit"
              onClick={() => setUserDrawerOpen(true)}
            >
              <AccountCircle />
            </IconButton>

            <Drawer
              anchor="right"
              open={userDrawerOpen}
              onClose={() => setUserDrawerOpen(false)}
            >
              <Box sx={{ width: 260 }} role="presentation">
                <List sx={{ py: 0 }}>
                  <ListItem>
                    <ListItemIcon>
                      <AccountCircle />
                    </ListItemIcon>
                    <ListItemText primary={name || 'Account'} />
                  </ListItem>
                  <Divider />
                  <ListItemButton
                    component={RouterLink}
                    to="/profile"
                    onClick={() => setUserDrawerOpen(false)}
                  >
                    <ListItemIcon>
                      <PersonOutlineIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                  </ListItemButton>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </List>
              </Box>
            </Drawer>

            {/* Logout snackbar */}
            <Snackbar
              open={snackOpen}
              autoHideDuration={2500}
              onClose={() => setSnackOpen(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert
                onClose={() => setSnackOpen(false)}
                severity="success"
                variant="filled"
                sx={{ width: '100%' }}
              >
                Signed out
              </Alert>
            </Snackbar>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
