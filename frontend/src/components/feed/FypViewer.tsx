// src/components/feed/FypViewer.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import { CommonAPI, FeedAPI, VideosAPI } from '../../services/api';
import CommentsDrawer from './CommentsDrawer';
import QuizModal from './QuizModal';
import { useNavigate } from 'react-router-dom';

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

export default function FypViewer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const nav = useNavigate();

  const TOP = isMobile ? 48 : 56;
  const BOTTOM = isMobile ? 96 : 110;
  const RIGHT_GAP = isMobile ? 8 : 16;

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
          : typeof full?._count?.likes === 'number'
          ? full._count.likes
          : null;
      const serverLiked = !!full?.likedByMe;
      setLikesCount(serverLikes);
      setLiked(serverLiked);
      likeCacheRef.current.set(videoId, { liked: serverLiked, count: serverLikes });
    } catch {
      // ignore
    }
  }

  // fetch next; exclude only when explicitly skipping the current one
  const fetchNext = async (excludeId?: string | null) => {
    setLoading(true);
    setErr(undefined);
    setPlayUrl(null);
    setItem(null);
    try {
      const next = await FeedAPI.next(catId ? Number(catId) : undefined, excludeId || undefined);

      setItem(next);

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

      hydrateMeta(next.id);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'No videos available');
    } finally {
      setLoading(false);
    }
  };

  // on category change → no exclusion
  useEffect(() => {
    fetchNext(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catId]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, playUrl]);

  const duration = useMemo(
    () => videoRef.current?.duration || item?.durationSec || 0,
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

    const nextCount = typeof likesCount === 'number' ? likesCount + (wantLike ? 1 : -1) : null;
    setLiked(wantLike);
    if (nextCount !== null) setLikesCount(nextCount);
    likeCacheRef.current.set(item.id, { liked: wantLike, count: nextCount });

    try {
      if (wantLike) await VideosAPI.like(item.id);
      else await VideosAPI.unlike(item.id);
      hydrateMeta(item.id);
    } catch {
      const prevLiked = !wantLike;
      const reverted = typeof likesCount === 'number' ? likesCount + (wantLike ? -1 : 1) : null;
      setLiked(prevLiked);
      if (reverted !== null) setLikesCount(reverted);
      likeCacheRef.current.set(item.id, { liked: prevLiked, count: reverted });
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        bgcolor: 'black',
        overflow: 'hidden',
        pb: 'var(--safe-bottom)',
        pt: 'var(--safe-top)',
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: TOP,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          bgcolor: 'rgba(0,0,0,0.25)',
          zIndex: 2,
          backdropFilter: 'blur(4px)',
          gap: 1,
        }}
      >
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: isMobile ? 16 : 18 }}>
          For You
        </Typography>

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
              const found = categories.find((c) => c.id === Number(val));
              return found?.name ?? 'All';
            },
            MenuProps: { PaperProps: { sx: { maxHeight: 320 } } },
          }}
          sx={{
            width: { xs: 150, sm: 220 },
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiInputLabel-root': { color: '#fff' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
          }}
        >
          <MenuItem value="">All</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Video area */}
      <Box
        sx={{
          position: 'absolute',
          top: TOP,
          bottom: BOTTOM,
          left: 0,
          right: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          onClick={() => setPaused((p) => !p)}
          sx={{
            position: 'absolute',
            inset: 0,
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
              onEnded={() => fetchNext(item?.id || null)}
              style={{
                width: isMobile ? '100%' : 'auto',
                height: isMobile ? '100%' : 'auto',
                maxWidth: isMobile ? '100%' : '40%',
                maxHeight: isMobile ? '100%' : '50%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}
        </Box>
      </Box>

      {/* Right controls (desktop) */}
      <Stack
        spacing={2}
        sx={{
          position: 'absolute',
          right: 12,
          bottom: BOTTOM + RIGHT_GAP,
          zIndex: 3,
          alignItems: 'center',
          display: { xs: 'none', sm: 'flex' },
        }}
      >
        <Tooltip title={paused ? 'Play' : 'Pause'}>
          <IconButton
            onClick={() => setPaused((p) => !p)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
          >
            {paused ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={liked ? 'Unlike' : 'Like'}>
          <Badge badgeContent={typeof likesCount === 'number' ? likesCount : undefined} color="error">
            <IconButton
              onClick={toggleLike}
              sx={{ color: liked ? '#ff3b5c' : '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
            >
              <FavoriteBorderIcon />
            </IconButton>
          </Badge>
        </Tooltip>

        <Tooltip title="Comments">
          <IconButton
            onClick={() => setCommentsOpen(true)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
          >
            <ChatBubbleOutlineIcon />
          </IconButton>
        </Tooltip>

        {/* ✅ QUIZ BUTTON (desktop) */}
        <Tooltip title="Quiz">
          <IconButton
            onClick={() => {
              setPaused(true); // pause playback while quizzing
              setQuizOpen(true);
            }}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
            disabled={!item}
          >
            <QuizOutlinedIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={muted ? 'Unmute' : 'Mute'}>
          <IconButton
            onClick={() => setMuted((m) => !m)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
          >
            {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Next">
          <IconButton
            onClick={() => fetchNext(item?.id || null)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
          >
            <SkipNextIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Bottom controls (mobile) */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'absolute',
          left: 8,
          right: 8,
          bottom: BOTTOM + 8,
          zIndex: 3,
          display: { xs: 'flex', sm: 'none' },
          justifyContent: 'center',
        }}
      >
        <IconButton
          onClick={() => setPaused((p) => !p)}
          sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
        >
          {paused ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
        </IconButton>
        <IconButton
          onClick={toggleLike}
          sx={{ color: liked ? '#ff3b5c' : '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
        >
          <FavoriteBorderIcon />
        </IconButton>
        <IconButton
          onClick={() => setCommentsOpen(true)}
          sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
        >
          <ChatBubbleOutlineIcon />
        </IconButton>

        {/* ✅ QUIZ BUTTON (mobile) */}
        <IconButton
          onClick={() => {
            setPaused(true);
            setQuizOpen(true);
          }}
          sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
          disabled={!item}
        >
          <QuizOutlinedIcon />
        </IconButton>

        <IconButton
          onClick={() => setMuted((m) => !m)}
          sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
        >
          {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
        <IconButton
          onClick={() => fetchNext(item?.id || null)}
          sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
        >
          <SkipNextIcon />
        </IconButton>
      </Stack>

      {/* Bottom bar (title + scrubber) */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: BOTTOM,
          p: { xs: 1.25, sm: 2 },
          zIndex: 3,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 35%, rgba(0,0,0,.85) 100%)',
        }}
      >
        {item && (
          <>
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: isMobile ? 14 : 16 }} noWrap>
              {item.title}
            </Typography>
            <Typography sx={{ color: '#ddd', fontSize: isMobile ? 12 : 14 }} noWrap>
              <span
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  const uname = item.author?.username || item.author?.displayName;
                  if (uname) nav(`/u/${encodeURIComponent(uname)}`);
                }}
              >
                {item.author?.displayName || item.author?.username || 'Unknown'}
              </span>{' '}
              · {item.category?.name || 'All'}
            </Typography>

            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: '#ccc', minWidth: 38 }} variant="caption">
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
              <Typography sx={{ color: '#ccc', minWidth: 38, textAlign: 'right' }} variant="caption">
                {Math.floor(duration || item.durationSec || 0)}s
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Modals */}
      <CommentsDrawer
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        videoId={item?.id || null}
      />
      <QuizModal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        videoId={item?.id || null}
        onGoToCourse={(sectionId, courseId) => {
          setQuizOpen(false);
          nav(`/courses/${courseId}/sections/${sectionId}`);
        }}
      />
    </Box>
  );
}
