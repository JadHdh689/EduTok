// src/components/video/VideoPlayerDialog.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  Slide,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import { VideosAPI } from '../../services/api';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
  open: boolean;
  videoId: string | null;
  title?: string;
  initialMuted?: boolean; // default false; we’ll attempt unmuted first
  onClose: () => void;
  onOpenComments?: (videoId?: string | null) => void;
  onTakeQuiz?: (videoId?: string | null) => void;
};

export default function VideoPlayerDialog({
  open,
  videoId,
  title,
  initialMuted = false,
  onClose,
  onOpenComments,
  onTakeQuiz,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <600px

  // same chrome sizing as FYP
  const TOP = isMobile ? 48 : 56;
  const BOTTOM = isMobile ? 96 : 110;
  const RIGHT_GAP = isMobile ? 8 : 16;

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState<boolean>(initialMuted);
  const [progress, setProgress] = useState(0);
  const [durationOverride, setDurationOverride] = useState<number | null>(null);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number | null>(null);

  // hydrate like meta for the given video
  async function hydrateMeta(id: string) {
    try {
      const full = await VideosAPI.get(id);
      const serverLikes =
        typeof full?.likesCount === 'number'
          ? full.likesCount
          : typeof full?._count?.likes === 'number'
          ? full._count.likes
          : null;
      setLikesCount(serverLikes);
      setLiked(!!full?.likedByMe);
    } catch {
      // ignore
    }
  }

  // load stream url on open
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!open || !videoId) return;
      setLoading(true);
      setErr(undefined);
      setPlayUrl(null);
      setPaused(false);
      setProgress(0);
      setDurationOverride(null);
      setMuted(initialMuted);

      try {
        // meta first so the heart/count are ready
        await hydrateMeta(videoId);

        const { url } = await VideosAPI.streamUrl(videoId);
        if (!cancelled) {
          setPlayUrl(url);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.response?.data?.message || e.message || 'Failed to load video');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      const v = videoRef.current;
      if (v) {
        try {
          v.pause();
          // eslint-disable-next-line no-empty
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, videoId]);

  // try to play with sound; if blocked, fallback to muted
  const playRespectingAutoplay = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = false;
      await v.play();
      setMuted(false);
      setPaused(false);
    } catch {
      // policy blocked: try muted
      v.muted = true;
      setMuted(true);
      await v.play().catch(() => {});
      setPaused(false);
    }
  };

  // when url is ready, attempt playback
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !playUrl) return;
    // start with user-preferred initialMuted; then try unmuted if false
    if (initialMuted) {
      v.muted = true;
      v.play().catch(() => {});
      setPaused(false);
    } else {
      playRespectingAutoplay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playUrl]);

  // respond to paused/muted toggles
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, muted]);

  // progress/duration
  const duration = useMemo(
    () => durationOverride ?? videoRef.current?.duration ?? 0,
    [durationOverride, playUrl],
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setProgress(v.currentTime || 0);
    const onMeta = () => setDurationOverride(v.duration || 0);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
    };
  }, [playUrl]);

  const onSeek = (secs: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(secs, v.duration || secs));
    setProgress(v.currentTime);
  };

  async function toggleLike() {
    if (!videoId) return;
    const wantLike = !liked;
    const nextCount = typeof likesCount === 'number' ? likesCount + (wantLike ? 1 : -1) : null;

    setLiked(wantLike);
    if (nextCount !== null) setLikesCount(nextCount);

    try {
      if (wantLike) await VideosAPI.like(videoId);
      else await VideosAPI.unlike(videoId);
      await hydrateMeta(videoId);
    } catch {
      // revert
      const prevLiked = !wantLike;
      const reverted = typeof likesCount === 'number' ? likesCount + (wantLike ? -1 : 1) : null;
      setLiked(prevLiked);
      if (reverted !== null) setLikesCount(reverted);
    }
  }

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      PaperProps={{ sx: { bgcolor: 'black' } }}
      keepMounted
      disableRestoreFocus
    >
      {/* Top bar (like FYP) */}
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
          zIndex: 3,
          backdropFilter: 'blur(4px)',
          gap: 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: isMobile ? 16 : 18 }} noWrap>
          {title || 'Video'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* SAFE AREA for video */}
      <Box
        sx={{
          position: 'absolute',
          top: TOP,
          bottom: BOTTOM,
          left: 0,
          right: 0,
          overflow: 'hidden',
        }}
        onClick={() => setPaused((p) => !p)}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {err && <Typography sx={{ color: '#ff6b6b' }}>{err}</Typography>}
          {!err && loading && <CircularProgress sx={{ color: '#fff' }} />}

          {!loading && playUrl && (
            <video
              key={playUrl}
              ref={videoRef}
              src={playUrl}
              autoPlay
              muted={muted}
              playsInline
              preload="auto"
              onEnded={() => setPaused(true)}
              onError={() => setErr('Could not load video')}
              style={{
                // Desktop centers a contained box; Mobile fills area
                width: isMobile ? '100%' : 'auto',
                height: isMobile ? '100%' : 'auto',
                maxWidth: isMobile ? '100%' : '40%',
                maxHeight: isMobile ? '100%' : '50%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}

          {/* Big play overlay when paused */}
          {paused && !err && playUrl && (
            <PlayCircleOutlineIcon
              sx={{ position: 'absolute', fontSize: 96, color: '#fff', pointerEvents: 'none' }}
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
          zIndex: 4,
          alignItems: 'center',
          display: { xs: 'none', sm: 'flex' }, // hide on mobile
        }}
        onClick={(e) => e.stopPropagation()}
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
            onClick={() => onOpenComments?.(videoId)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
          >
            <ChatBubbleOutlineIcon />
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

        <Tooltip title="Take quiz">
          <IconButton
            onClick={() => onTakeQuiz?.(videoId)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
          >
            <QuizOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Bottom *row* controls (mobile) */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'absolute',
          left: 8,
          right: 8,
          bottom: BOTTOM + 8,
          zIndex: 4,
          display: { xs: 'flex', sm: 'none' },
          justifyContent: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
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
          onClick={() => onOpenComments?.(videoId)}
          sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
        >
          <ChatBubbleOutlineIcon />
        </IconButton>
        <IconButton
          onClick={() => setMuted((m) => !m)}
          sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
        >
          {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
        <IconButton
          onClick={() => onTakeQuiz?.(videoId)}
          sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
        >
          <QuizOutlinedIcon />
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
        onClick={(e) => e.stopPropagation()}
      >
        <Typography
          sx={{ color: '#fff', fontWeight: 600, fontSize: isMobile ? 14 : 16 }}
          noWrap
        >
          {title || 'Video'}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ color: '#ccc', minWidth: 38 }} variant="caption">
            {Math.floor(progress)}s
          </Typography>
          <input
            type="range"
            min={0}
            max={Math.max(1, duration || 1)}
            value={progress}
            onChange={(e) => onSeek(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <Typography sx={{ color: '#ccc', minWidth: 38, textAlign: 'right' }} variant="caption">
            {Math.floor(duration || 0)}s
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
}
