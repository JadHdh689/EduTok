import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Box, CircularProgress, IconButton, MenuItem, Stack, TextField, Tooltip, Typography, Badge
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import { useNavigate } from 'react-router-dom';
import { CommonAPI, FeedAPI, VideosAPI } from '../../services/api';
import CommentsDrawer from './CommentsDrawer';
import QuizModal from './QuizModal';

type FeedItem = {
  id: string;
  title: string;
  description?: string | null;
  durationSec: number;
  category?: { id: number; name: string } | null;
  author?: { id: string; username: string; displayName: string; avatarUrl?: string | null } | null;
  likesCount?: number;
  commentsCount?: number;
  likedByMe?: boolean;
};

const UI = {
  TOP: 56,
  BOTTOM: 110,
  RIGHT_STACK_GAP: 16,
};

export default function FypViewer() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [catId, setCatId] = useState<number | ''>(() => {
    const saved = localStorage.getItem('fyp.cat');
    return saved ? Number(saved) : '';
  });
  const [item, setItem] = useState<FeedItem | null>(null);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastIdRef = useRef<string | null>(null);

  // keep like state snappy across tab/category switches
  const likeCacheRef = useRef<Map<string, { liked: boolean; count: number | null }>>(new Map());

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

  useEffect(() => {
    if (catId === '') localStorage.removeItem('fyp.cat');
    else localStorage.setItem('fyp.cat', String(catId));
  }, [catId]);

  async function hydrateMeta(videoId: string) {
    try {
      const full = await VideosAPI.get(videoId);
      const serverLikes =
        typeof full?.likesCount === 'number'
          ? full.likesCount
          : typeof (full as any)?._count?.likes === 'number'
          ? (full as any)._count.likes
          : null;
      const serverLiked = !!(full as any)?.likedByMe;
      setLikesCount(serverLikes);
      setLiked(serverLiked);
      likeCacheRef.current.set(videoId, { liked: serverLiked, count: serverLikes });
    } catch {
      // ignore — we already show cached/optimistic
    }
  }

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

      // use cached like state instantly (prevents heart flashing off)
      const cached = likeCacheRef.current.get(next.id);
      if (cached) {
        setLiked(cached.liked);
        setLikesCount(cached.count);
      } else {
        setLiked(!!next.likedByMe);
        setLikesCount(typeof next.likesCount === 'number' ? next.likesCount : null);
      }

      const { url } = await VideosAPI.streamUrl(next.id);
      setPlayUrl(url);
      setPaused(false);
      setProgress(0);

      // fetch authoritative meta (likedByMe/likesCount)
      hydrateMeta(next.id);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'No videos available');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNext(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catId]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, playUrl]);

  const duration = useMemo(
    () => (videoRef.current?.duration && isFinite(videoRef.current.duration)
      ? videoRef.current.duration
      : (item?.durationSec ?? 0)),
    [item, playUrl]
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setProgress(v.currentTime || 0);
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, [playUrl]);

  const onSeek = (secs: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(secs, v.duration || secs));
    setProgress(v.currentTime);
  };

  async function toggleLike() {
    if (!item) return;
    const wantLike = !liked;

    // optimistic update + cache
    const nextCount = typeof likesCount === 'number' ? likesCount + (wantLike ? 1 : -1) : null;
    setLiked(wantLike);
    if (nextCount !== null) setLikesCount(nextCount);
    likeCacheRef.current.set(item.id, { liked: wantLike, count: nextCount });

    try {
      if (wantLike) await VideosAPI.like(item.id);
      else await VideosAPI.unlike(item.id);

      // optional: re-hydrate to ensure server truth
      hydrateMeta(item.id);
    } catch {
      // revert on error
      const prevLiked = !wantLike;
      const reverted = typeof likesCount === 'number' ? likesCount + (wantLike ? -1 : 1) : null;
      setLiked(prevLiked);
      if (reverted !== null) setLikesCount(reverted);
      likeCacheRef.current.set(item.id, { liked: prevLiked, count: reverted });
    }
  }

  const goToAuthorProfile = () => {
    if (!item?.author?.username) return;
    navigate(`/u/${item.author.username}`);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh', bgcolor: 'black', overflow: 'hidden' }}>
      {/* Top bar */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: UI.TOP,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, bgcolor: 'rgba(0,0,0,0.25)', zIndex: 2, backdropFilter: 'blur(4px)'
      }}>
        <Typography sx={{ color: '#fff', fontWeight: 700 }}>For You</Typography>

        <TextField
          select
          size="small"
          value={catId}
          onChange={(e) => setCatId(e.target.value === '' ? '' : Number(e.target.value))}
          label="Category"
          InputLabelProps={{ shrink: true }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (val) => {
              if (val === '' || val === undefined) return 'All';
              const found = categories.find(c => c.id === Number(val));
              return found?.name ?? 'All';
            },
            MenuProps: { PaperProps: { sx: { maxHeight: 320 } } },
          }}
          sx={{
            width: 220,
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiInputLabel-root': { color: '#fff' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
          }}
        >
          <MenuItem value="">All</MenuItem>
          {categories.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      {/* SAFE AREA */}
      <Box sx={{ position: 'absolute', top: UI.TOP, bottom: UI.BOTTOM, left: 0, right: 0, overflow: 'hidden' }}>
        {/* Absolute centerer */}
        <Box
          onClick={() => setPaused(p => !p)}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {err && <Alert severity="error">{err}</Alert>}
          {!err && loading && <CircularProgress sx={{ color: '#fff' }} />}

          {!loading && playUrl && (
            <video
              key={playUrl}
              ref={videoRef}
              src={playUrl}
              autoPlay
              muted={muted}
              loop={false}
              playsInline
              preload="auto"
              onEnded={() => fetchNext(item?.id || undefined)}
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '40%',
                maxHeight: '50%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}
        </Box>
      </Box>

      {/* Right controls */}
      <Stack
        spacing={2}
        sx={{
          position: 'absolute',
          right: 12,
          bottom: UI.BOTTOM + UI.RIGHT_STACK_GAP,
          zIndex: 3,
          alignItems: 'center'
        }}
      >
        <Tooltip title={paused ? 'Play' : 'Pause'}>
          <IconButton onClick={() => setPaused(p => !p)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}>
            {paused ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={liked ? 'Unlike' : 'Like'}>
          <Badge badgeContent={typeof likesCount === 'number' ? likesCount : undefined} color="error">
            <IconButton onClick={toggleLike} sx={{ color: liked ? '#ff3b5c' : '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}>
              <FavoriteBorderIcon />
            </IconButton>
          </Badge>
        </Tooltip>

        <Tooltip title="Comments">
          <IconButton onClick={() => setCommentsOpen(true)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}>
            <ChatBubbleOutlineIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={muted ? 'Unmute' : 'Mute'}>
          <IconButton onClick={() => setMuted(m => !m)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}>
            {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Take quiz">
          <IconButton onClick={() => setQuizOpen(true)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}>
            <QuizOutlinedIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Next">
          <IconButton onClick={() => fetchNext(item?.id)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}>
            <SkipNextIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Bottom bar */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: UI.BOTTOM,
          p: 2,
          zIndex: 3,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 35%, rgba(0,0,0,.85) 100%)',
        }}
      >
        {item && (
          <>
            <Typography sx={{ color: '#fff', fontWeight: 600 }} noWrap>{item.title}</Typography>
            <Typography
              sx={{
                color: '#ddd',
                cursor: item.author?.username ? 'pointer' : 'default',
                textDecoration: item.author?.username ? 'underline' : 'none',
                textUnderlineOffset: '2px',
                '&:hover': { opacity: item.author?.username ? 0.9 : 1 },
              }}
              noWrap
              onClick={goToAuthorProfile}
              title={item.author?.username ? `View @${item.author.username}` : undefined}
            >
              {item.author?.displayName || item.author?.username || 'Unknown'} · {item.category?.name || 'All'}
            </Typography>

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

      {/* Modals */}
      <CommentsDrawer open={commentsOpen} onClose={() => setCommentsOpen(false)} videoId={item?.id || null} />
      <QuizModal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        videoId={item?.id || null}
        onGoToCourse={(sectionId) => {
          console.log('Go to course section', sectionId);
          setQuizOpen(false);
        }}
      />
    </Box>
  );
}
