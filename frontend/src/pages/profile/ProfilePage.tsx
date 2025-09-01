// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/pages/profile/ProfilePage.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import {
  Avatar, Box, Container, Grid, Paper, Stack, Tab, Tabs, Typography,
  Divider, Button, Chip, Alert, CircularProgress, Card, CardActionArea, CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ProfileAPI, PublicProfilesAPI } from '../../services/api';
import ProfileEditCard from '../../components/profile/ProfileEditCard';
import VideoUploadForm from '../../components/profile/VideoUploadForm';
import MyVideosList from '../../components/profile/MyVideosList';
import MyCoursesList from '../../components/profile/MyCoursesList';

type TabKey = 'upload'|'videos'|'courses'|'edit'|'followers'|'following';

type LiteUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
};

export default function ProfilePage() {
  const nav = useNavigate();

  const [tab, setTab] = useState<TabKey>('upload');
  const [me, setMe] = useState<any>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  // followers/following lists
  const [followers, setFollowers] = useState<LiteUser[]>([]);
  const [following, setFollowing] = useState<LiteUser[]>([]);
  const [netLoading, setNetLoading] = useState(false);
  const [netErr, setNetErr] = useState<string>();

  // counts
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const m = await ProfileAPI.me();
      setMe(m);
    })();
  }, [refreshFlag]);

  // fetch counts once we know my username
  useEffect(() => {
    (async () => {
      if (!me?.username) return;
      try {
        const info = await PublicProfilesAPI.get(me.username);
        setFollowersCount(info?.stats?.followers ?? 0);
        setFollowingCount(info?.stats?.following ?? 0);
      } catch {
        // best-effort; hide errors
      }
    })();
  }, [me?.username]);

  // lazy-load lists when switching to tabs
  useEffect(() => {
    if (!me?.username) return;
    const run = async () => {
      setNetErr(undefined);
      setNetLoading(true);
      try {
        if (tab === 'followers') {
          const list = await PublicProfilesAPI.followers(me.username, 50, 0);
          setFollowers(list);
        } else if (tab === 'following') {
          const list = await PublicProfilesAPI.following(me.username, 50, 0);
          setFollowing(list);
        }
      } catch (e: any) {
        setNetErr(e?.response?.data?.message || e.message || 'Failed to load list');
      } finally {
        setNetLoading(false);
      }
    };
    if ((tab === 'followers' && followers.length === 0) ||
        (tab === 'following' && following.length === 0)) {
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, me?.username]);

  function handleUpdated() {
    setRefreshFlag((x)=>x+1);
  }

  const openUser = (username: string) => nav(`/u/${encodeURIComponent(username)}`);

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

              {/* Counts */}
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`${followersCount} Followers`}
                  onClick={() => setTab('followers')}
                  variant={tab === 'followers' ? 'filled' : 'outlined'}
                  color={tab === 'followers' ? 'primary' : 'default'}
                />
                <Chip
                  label={`${followingCount} Following`}
                  onClick={() => setTab('following')}
                  variant={tab === 'following' ? 'filled' : 'outlined'}
                  color={tab === 'following' ? 'primary' : 'default'}
                />
              </Stack>

              {me?.bio && <Typography variant="body2" sx={{ textAlign: 'center' }}>{me.bio}</Typography>}
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
              <Tab label="Followers" value="followers" />
              <Tab label="Following" value="following" />
              <Tab label="Edit Profile" value="edit" />
            </Tabs>

            {tab === 'upload' && <VideoUploadForm onUploaded={()=>setTab('videos')} />}
            {tab === 'videos' && <MyVideosList />}
            {tab === 'courses' && <MyCoursesList />}
            {tab === 'edit' && <ProfileEditCard me={me} onSaved={handleUpdated} />}

            {/* Followers tab */}
            {tab === 'followers' && (
              <Box>
                {netErr && <Alert severity="error" sx={{ mb: 2 }}>{netErr}</Alert>}
                {netLoading ? (
                  <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </Stack>
                ) : followers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No followers yet.</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {followers.map(u => (
                      <Grid key={u.id} item xs={12} sm={6}>
                        <Card variant="outlined">
                          <CardActionArea onClick={() => openUser(u.username)}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar src={u.avatarUrl || undefined}>
                                {(u.displayName || u.username || '?')[0]?.toUpperCase()}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle2" noWrap>
                                  {u.displayName || u.username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  @{u.username}
                                </Typography>
                              </Box>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Following tab */}
            {tab === 'following' && (
              <Box>
                {netErr && <Alert severity="error" sx={{ mb: 2 }}>{netErr}</Alert>}
                {netLoading ? (
                  <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </Stack>
                ) : following.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">You aren’t following anyone yet.</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {following.map(u => (
                      <Grid key={u.id} item xs={12} sm={6}>
                        <Card variant="outlined">
                          <CardActionArea onClick={() => openUser(u.username)}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar src={u.avatarUrl || undefined}>
                                {(u.displayName || u.username || '?')[0]?.toUpperCase()}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle2" noWrap>
                                  {u.displayName || u.username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  @{u.username}
                                </Typography>
                              </Box>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
