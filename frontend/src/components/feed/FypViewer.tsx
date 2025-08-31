//src/components/feed/FypViewer.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Box, CircularProgress, IconButton, MenuItem, Stack, TextField, Tooltip, Typography
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { CommonAPI, FeedAPI, VideosAPI } from '../../services/api';

type FeedItem = {
  id: string;
  title: string;
  description?: string | null;
  durationSec: number;
  category?: { id: number; name: string } | null;
  author?: { id: string; username: string; displayName: string; avatarUrl?: string | null } | null;
};

export default function FypViewer() {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [catId, setCatId] = useState<number | ''>(''); // '' = All
  const [item, setItem] = useState<FeedItem | null>(null);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0); // seconds

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastIdRef = useRef<string | null>(null); // for exclude

  // load categories once
  useEffect(() => {
    (async () => {
      try {
        const cats = await CommonAPI.listCategories();
        setCategories(cats);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load categories');
      }
    })();
  }, []);

  // fetch the next feed item
  const fetchNext = async (explicitExcludeId?: string) => {
    setLoading(true);
    setErr(undefined);
    setPlayUrl(null);
    setItem(null);
    try {
      const exclude = explicitExcludeId ?? lastIdRef.current ?? undefined;
      const next = await FeedAPI.next(catId ? Number(catId) : undefined, exclude);
      setItem(next);
      lastIdRef.current = next.id;
      // request signed URL (marks seen server-side)
      const { url } = await VideosAPI.streamUrl(next.id);
      setPlayUrl(url);
      setPaused(false);
      setProgress(0);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'No videos available');
    } finally {
      setLoading(false);
    }
  };

  // on mount & when category changes, pull a video
  useEffect(() => {
    fetchNext(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catId]);

  // keep play/pause in sync
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, playUrl]);

  const duration = useMemo(() => (videoRef.current?.duration || (item?.durationSec ?? 0)), [item, playUrl]);

  // timeupdate -> progress
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setProgress(v.currentTime || 0);
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, [playUrl]);

  // seek handler
  const onSeek = (secs: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(secs, v.duration || secs));
    setProgress(v.currentTime);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: 'calc(100vh - 64px)', bgcolor: 'black' }}>
      {/* Top bar */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, bgcolor: 'rgba(0,0,0,0.25)', zIndex: 2, backdropFilter: 'blur(4px)'
      }}>
        <Typography sx={{ color: '#fff', fontWeight: 700 }}>For You</Typography>
        <TextField
          select size="small" value={catId} onChange={(e) => setCatId(e.target.value === '' ? '' : Number(e.target.value))}
          sx={{ minWidth: 180, '& .MuiInputBase-input': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#fff' } }}
          label="Category" SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">All</MenuItem>
          {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
      </Box>

      {/* Center stage */}
      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        {err && <Alert severity="error">{err}</Alert>}
        {!err && loading && <CircularProgress sx={{ color: '#fff' }} />}

        {!loading && playUrl && (
          <Box
            onClick={() => setPaused(p => !p)}
            sx={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}
          >
            <video
              key={playUrl}
              ref={videoRef}
              src={playUrl}
              autoPlay
              muted={muted}
              loop={false}
              playsInline
              preload="auto"
              onEnded={() => fetchNext(item?.id)}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </Box>
        )}
      </Box>

      {/* Right-side controls */}
      <Stack spacing={2} sx={{ position: 'absolute', right: 12, bottom: 96, zIndex: 3, alignItems: 'center' }}>
        <Tooltip title={paused ? 'Play' : 'Pause'}>
          <IconButton onClick={() => setPaused(p => !p)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}>
            {paused ? <PlayCircleOutlineIcon /> : <PauseCircleOutlineIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={muted ? 'Unmute' : 'Mute'}>
          <IconButton onClick={() => setMuted(m => !m)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}>
            {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Next">
          <IconButton onClick={() => fetchNext(item?.id)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}>
            <SkipNextIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Bottom bar: seek + metadata */}
      <Box sx={{
        position: 'absolute', left: 0, right: 0, bottom: 0, p: 2, zIndex: 3,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 35%, rgba(0,0,0,.85) 100%)'
      }}>
        {item && (
          <>
            <Typography sx={{ color: '#fff', fontWeight: 600 }} noWrap>{item.title}</Typography>
            <Typography sx={{ color: '#ddd' }} noWrap>
              {item.author?.displayName || item.author?.username || 'Unknown'} · {item.category?.name || 'All'}
            </Typography>

            {/* Seek bar */}
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: '#ccc', minWidth: 42 }} variant="caption">
                {Math.floor(progress)}s
              </Typography>
              <input
                type="range"
                min={0}
                max={Math.max(1, duration || item.durationSec || 1)}
                value={progress}
                onChange={(e) => onSeek(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <Typography sx={{ color: '#ccc', minWidth: 42, textAlign: 'right' }} variant="caption">
                {Math.floor(duration || item.durationSec || 0)}s
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
