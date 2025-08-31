//src/components/video/VideoPlayerDialog.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  Slide,
  Stack,
  Tooltip,
  Typography,
  Slider,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
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
  onClose: () => void;
  onOpenComments?: (videoId: string) => void;
  onTakeQuiz?: (videoId: string) => void;
};

function formatTime(sec: number) {
  const s = Math.floor(sec || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export default function VideoPlayerDialog({
  open,
  videoId,
  title,
  onClose,
  onOpenComments,
  onTakeQuiz,
}: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string>();
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(true);       // start muted to satisfy autoplay policies
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Fetch signed URL when opened for a given video
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!open || !videoId) return;
      setErr(undefined);
      setUrl(null);
      setPaused(false);
      setMuted(true);           // reset to muted on each open
      setDuration(0);
      setCurrent(0);
      try {
        const { url } = await VideosAPI.streamUrl(videoId);
        if (!cancelled) setUrl(url);
      } catch (e: any) {
        if (!cancelled) setErr(e?.response?.data?.message || e.message || 'Failed to load video');
      }
    })();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [open, videoId]);

  // Apply paused state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused]);

  // Apply muted state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    // If user unmutes, ensure we’re playing (browsers require user gesture, which clicking the button is)
    if (!muted) {
      v.play().catch(() => {});
    }
  }, [muted]);

  // When URL changes, kick off autoplay (muted)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !url) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [url]);

  // Track currentTime with rAF for a smooth slider
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const tick = () => {
      if (v && !isNaN(v.currentTime)) {
        setCurrent(v.currentTime);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [url]);

  // Handlers
  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration || 0);
  };

  const onSeek = (_: Event, value: number | number[]) => {
    // live update the thumb label while dragging
    if (typeof value === 'number') setCurrent(value);
  };

  const onSeekCommit = (_: Event, value: number | number[]) => {
    const v = videoRef.current;
    if (!v || typeof value !== 'number') return;
    v.currentTime = value;
  };

  const toggleMute = () => setMuted((m) => !m);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      PaperProps={{ sx: { bgcolor: 'black' } }}
    >
      {/* Top bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          zIndex: 2,
          bgcolor: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <Typography sx={{ color: '#fff', fontWeight: 600, px: 1 }} noWrap>
          {title || 'Video'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Video area */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => setPaused((p) => !p)}
      >
        {err && <Typography sx={{ color: '#ff6b6b' }}>{err}</Typography>}
        {!err && !url && <CircularProgress sx={{ color: '#fff' }} />}
        {url && (
          <video
            key={url}
            ref={videoRef}
            src={url}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            onLoadedMetadata={onLoadedMetadata}
            onError={() => setErr('Could not load video')}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        )}
        {paused && !err && url && (
          <PlayCircleOutlineIcon
            sx={{ position: 'absolute', fontSize: 96, color: '#fff' }}
          />
        )}
      </Box>

      {/* Right-side buttons */}
      <Stack
        spacing={2}
        sx={{
          position: 'fixed',
          right: 12,
          bottom: 112,
          zIndex: 2,
          alignItems: 'center',
          color: '#fff',
        }}
      >
        <Tooltip title={paused ? 'Play' : 'Pause'}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setPaused((p) => !p);
            }}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
          >
            {paused ? <PlayCircleOutlineIcon /> : <PauseCircleOutlineIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={muted ? 'Unmute' : 'Mute'}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
          >
            {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={liked ? 'Unlike' : 'Like'}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setLiked((v) => !v);
            }}
            sx={{
              color: liked ? '#ff3b5c' : '#fff',
              bgcolor: 'rgba(255,255,255,0.12)',
            }}
          >
            <FavoriteBorderIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Comments">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              videoId && onOpenComments?.(videoId);
            }}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
          >
            <ChatBubbleOutlineIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Take quiz">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              videoId && onTakeQuiz?.(videoId);
            }}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
          >
            <QuizOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Bottom gradient, title, and seek bar */}
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          pt: 2,
          pb: 2,
          px: 2,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 35%, rgba(0,0,0,.85) 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography sx={{ color: '#fff', mb: 1 }} noWrap>
          {title || 'Video'}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="caption" sx={{ color: '#fff', width: 36, textAlign: 'right' }}>
            {formatTime(current)}
          </Typography>
          <Slider
            value={Math.min(current, duration || 0)}
            min={0}
            max={duration || 0}
            step={0.1}
            onChange={onSeek}
            onChangeCommitted={onSeekCommit}
            sx={{
              color: '#fff',
              '& .MuiSlider-thumb': { width: 10, height: 10 },
            }}
          />
          <Typography variant="caption" sx={{ color: '#fff', width: 36 }}>
            {formatTime(duration)}
          </Typography>
        </Stack>
      </Box>
    </Dialog>
  );
}
