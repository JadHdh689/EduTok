import { useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Box, Button, Stack, TextField, Typography } from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useNavigate } from 'react-router-dom';
import { PublicProfilesAPI } from '../../services/api';

type Row = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  stats?: { followers: number; following: number };
  isFollowing?: boolean;
};

export default function PeopleSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      setErr(undefined);
      try {
        const data = await PublicProfilesAPI.search(q, 30, 0);
        setRows(data);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  async function toggle(u: Row) {
    try {
      if (u.isFollowing) {
        await PublicProfilesAPI.unfollow(u.username);
        setRows(prev => prev.map(r => r.id === u.id
          ? { ...r, isFollowing: false, stats: { ...(r.stats||{followers:0,following:0}), followers: Math.max(0, (r.stats?.followers ?? 0)-1) } }
          : r));
      } else {
        await PublicProfilesAPI.follow(u.username);
        setRows(prev => prev.map(r => r.id === u.id
          ? { ...r, isFollowing: true, stats: { ...(r.stats||{followers:0,following:0}), followers: (r.stats?.followers ?? 0)+1 } }
          : r));
      }
    } catch {/* ignore */}
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Find people</Typography>
      <TextField
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name or username…"
        fullWidth
        sx={{ mb: 2 }}
      />
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Stack spacing={1}>
        {rows.map(u => (
          <Stack
            key={u.id}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1,
            }}
          >
            <Avatar src={u.avatarUrl || undefined} />
            <Box sx={{ minWidth: 0, flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/u/${u.username}`)}>
              <Typography noWrap>{u.displayName} <Typography component="span" color="text.secondary">@{u.username}</Typography></Typography>
              <Typography variant="caption" color="text.secondary">
                {u.stats?.followers ?? 0} followers • {u.stats?.following ?? 0} following
              </Typography>
            </Box>
            <Button
              variant={u.isFollowing ? 'outlined' : 'contained'}
              startIcon={u.isFollowing ? <PersonRemoveIcon /> : <PersonAddAlt1Icon />}
              onClick={() => toggle(u)}
            >
              {u.isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          </Stack>
        ))}
        {!rows.length && !loading && <Typography color="text.secondary">No people yet.</Typography>}
      </Stack>
    </Box>
  );
}
