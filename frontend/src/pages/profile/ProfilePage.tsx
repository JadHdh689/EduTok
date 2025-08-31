// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/pages/profile/ProfilePage.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import {
  Avatar, Box, Container, Grid, Paper, Stack, Tab, Tabs, Typography, Divider, Button
} from '@mui/material';
import { ProfileAPI } from '../../services/api';
import ProfileEditCard from '../../components/profile/ProfileEditCard';
import VideoUploadForm from '../../components/profile/VideoUploadForm';
import MyVideosList from '../../components/profile/MyVideosList';
import MyCoursesList from '../../components/profile/MyCoursesList';

type TabKey = 'upload'|'videos'|'courses'|'edit';

export default function ProfilePage() {
  const [tab, setTab] = useState<TabKey>('upload');
  const [me, setMe] = useState<any>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    (async () => {
      const m = await ProfileAPI.me();
      setMe(m);
    })();
  }, [refreshFlag]);

  function handleUpdated() {
    setRefreshFlag((x)=>x+1);
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Left: Profile header card */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2} alignItems="center">
              <Avatar
                src={me?.avatarUrl || undefined}
                sx={{ width: 88, height: 88, fontSize: 28 }}
              >
                {me?.displayName?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box textAlign="center">
                <Typography variant="h6">{me?.displayName || 'User'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  @{me?.username}
                </Typography>
                {me?.email && (
                  <Typography variant="body2" color="text.secondary">
                    {me.email}
                  </Typography>
                )}
              </Box>
              {me?.bio && <Typography variant="body2">{me.bio}</Typography>}
              <Divider flexItem />
              <Button variant="outlined" onClick={()=>setTab('edit')}>Edit Profile</Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Right: Tabs content */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Tabs
              value={tab}
              onChange={(_e, v)=>setTab(v)}
              variant="scrollable"
              sx={{ mb: 2 }}
            >
              <Tab label="Upload Video" value="upload" />
              <Tab label="My Videos" value="videos" />
              <Tab label="My Courses" value="courses" />
              <Tab label="Edit Profile" value="edit" />
            </Tabs>

            {tab === 'upload' && <VideoUploadForm onUploaded={()=>setTab('videos')} />}
            {tab === 'videos' && <MyVideosList />}
            {tab === 'courses' && <MyCoursesList />}
            {tab === 'edit' && <ProfileEditCard me={me} onSaved={handleUpdated} />}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
