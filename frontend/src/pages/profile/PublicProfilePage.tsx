import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Card, CardContent, CardHeader, Chip, Grid, Stack, Tab, Tabs, Typography
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SchoolIcon from '@mui/icons-material/School';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useNavigate, useParams } from 'react-router-dom';
import { CoursesAPI, PublicProfilesAPI, VideosAPI } from '../../services/api';
import VideoPlayerDialog from '../../components/video/VideoPlayerDialog';

type VideoCard = {
  id: string;
  title: string;
  description?: string | null;
  durationSec: number;
  createdAt: string;
  category?: { id: number; name: string } | null;
  _count?: { likes?: number; comments?: number };
};

type CourseCard = {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  createdAt: string;
  _count?: { enrollments?: number };
};

type UserLite = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  stats?: { followers: number; following: number };
  isFollowing?: boolean;
};

export default function PublicProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();

  const [me, setMe] = useState<{
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    bio?: string | null;
    createdAt: string;
  } | null>(null);

  const [isMe, setIsMe] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });

  const [videos, setVideos] = useState<VideoCard[]>([]);
  const [courses, setCourses] = useState<CourseCard[]>([]);

  const [tab, setTab] = useState<'videos' | 'courses' | 'followers' | 'following'>('videos');
  const [followers, setFollowers] = useState<UserLite[]>([]);
  const [following, setFollowing] = useState<UserLite[]>([]);

  // video modal
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const [openVideoTitle, setOpenVideoTitle] = useState('');

  async function loadAll() {
    if (!username) return;
    setLoading(true);
    setErr(undefined);
    try {
      const data = await PublicProfilesAPI.get(username);
      if (!data?.user) {
        setErr('User not found');
        setMe(null);
        setVideos([]);
        setCourses([]);
      } else {
        setMe(data.user);
        setVideos(data.videos || []);
        setCourses(data.courses || []);
        setIsMe(!!data.isMe);
        setIsFollowing(!!data.isFollowing);
        setStats(data.stats || { followers: 0, following: 0 });

        // optimistic prefetch followers/following counts later
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function loadFollowers() {
    if (!username) return;
    try {
      const rows = await PublicProfilesAPI.followers(username, 30, 0);
      setFollowers(rows);
    } catch {/* ignore */}
  }
  async function loadFollowing() {
    if (!username) return;
    try {
      const rows = await PublicProfilesAPI.following(username, 30, 0);
      setFollowing(rows);
    } catch {/* ignore */}
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    if (tab === 'followers') loadFollowers();
    if (tab === 'following') loadFollowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, username]);

  async function onFollowToggle() {
    if (!username || isMe) return;
    try {
      if (isFollowing) {
        await PublicProfilesAPI.unfollow(username);
        setIsFollowing(false);
        setStats(s => ({ ...s, followers: Math.max(0, s.followers - 1) }));
      } else {
        await PublicProfilesAPI.follow(username);
        setIsFollowing(true);
        setStats(s => ({ ...s, followers: s.followers + 1 }));
      }
    } catch (e) {
      // noop — keep UI as-is
    }
  }

  const title = useMemo(
    () => (me?.displayName || me?.username ? `${me?.displayName} (@${me?.username})` : 'Profile'),
    [me]
  );

  return (
    <Box sx={{ p: 2 }}>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      {!err && (
        <>
          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56 }} src={me?.avatarUrl || undefined}>
              {(me?.displayName || me?.username || '?')[0]?.toUpperCase()}
            </Avatar>
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <Typography variant="h6" noWrap>{title}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Joined {me ? new Date(me.createdAt).toLocaleDateString() : '—'}
              </Typography>
            </Stack>
            <Box sx={{ flex: 1 }} />
            {!isMe && me && (
              <Button
                variant={isFollowing ? 'outlined' : 'contained'}
                startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddAlt1Icon />}
                onClick={onFollowToggle}
                disabled={loading}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </Stack>

          {me?.bio && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              {me.bio}
            </Typography>
          )}

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip label={`Followers: ${stats.followers}`} />
            <Chip label={`Following: ${stats.following}`} />
          </Stack>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 2 }}
          >
            <Tab value="videos" label="Videos" />
            <Tab value="courses" label="Courses" />
            <Tab value="followers" label="Followers" />
            <Tab value="following" label="Following" />
          </Tabs>

          {/* VIDEOS */}
          {tab === 'videos' && (
            <Grid container spacing={2}>
              {videos.map(v => (
                <Grid item xs={12} sm={6} md={4} key={v.id}>
                  <Card>
                    <CardHeader
                      title={<Typography noWrap>{v.title}</Typography>}
                      subheader={`${Math.round(v.durationSec)}s • ${v.category?.name || 'General'}`}
                      sx={{ pb: 0 }}
                    />
                    <CardContent sx={{ pt: 1 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {v.description || ' '}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }} alignItems="center">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <FavoriteBorderIcon fontSize="small" />
                          <Typography variant="caption">{v._count?.likes ?? 0}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <ChatBubbleOutlineIcon fontSize="small" />
                          <Typography variant="caption">{v._count?.comments ?? 0}</Typography>
                        </Stack>
                        <Box sx={{ flex: 1 }} />
                        <Button
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => { setOpenVideoTitle(v.title); setOpenVideoId(v.id); }}
                        >
                          Play
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {!videos.length && <Typography sx={{ px: 1 }}>No public videos.</Typography>}
            </Grid>
          )}

          {/* COURSES */}
          {tab === 'courses' && (
            <Grid container spacing={2}>
              {courses.map(c => (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <Card>
                    <CardHeader
                      avatar={<SchoolIcon />}
                      title={<Typography noWrap>{c.title}</Typography>}
                      subheader={new Date(c.createdAt).toLocaleDateString()}
                      sx={{ pb: 0 }}
                    />
                    <CardContent sx={{ pt: 1 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {c.description || ' '}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Chip size="small" label={`${c._count?.enrollments ?? 0} enrolled`} />
                        <Box sx={{ flex: 1 }} />
                        <Button size="small" onClick={() => navigate(`/courses/${c.id}`)}>
                          View
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {!courses.length && <Typography sx={{ px: 1 }}>No published courses.</Typography>}
            </Grid>
          )}

          {/* FOLLOWERS */}
          {tab === 'followers' && (
            <UserList users={followers} onClickUser={(u) => navigate(`/u/${u.username}`)} onToggle={(u)=>{}} />
          )}

          {/* FOLLOWING */}
          {tab === 'following' && (
            <UserList users={following} onClickUser={(u) => navigate(`/u/${u.username}`)} onToggle={(u)=>{}} />
          )}
        </>
      )}

      <VideoPlayerDialog
        open={!!openVideoId}
        videoId={openVideoId}
        title={openVideoTitle}
        onClose={() => setOpenVideoId(null)}
        onOpenComments={() => {}}
        onTakeQuiz={() => {}}
      />
    </Box>
  );
}

function UserList({
  users,
  onClickUser,
}: {
  users: UserLite[];
  onClickUser: (u: UserLite) => void;
}) {
  if (!users.length) return <Typography>No users yet.</Typography>;
  return (
    <Stack spacing={1}>
      {users.map(u => (
        <Stack
          key={u.id}
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'grey.50' },
          }}
          onClick={() => onClickUser(u)}
        >
          <Avatar src={u.avatarUrl || undefined}>{(u.displayName || u.username)[0]?.toUpperCase()}</Avatar>
          <Stack sx={{ minWidth: 0 }}>
            <Typography noWrap>{u.displayName} <Typography component="span" color="text.secondary">@{u.username}</Typography></Typography>
            <Typography variant="caption" color="text.secondary">
              {u.stats?.followers ?? 0} followers • {u.stats?.following ?? 0} following
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
