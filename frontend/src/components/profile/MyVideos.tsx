// src/components/profile/MyVideos.tsx
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';

import { VideosAPI } from '../../services/api';
import VideoPlayerDialog from '../video/VideoPlayerDialog';
import CommentsDrawer from '../feed/CommentsDrawer';
import QuizModal from '../feed/QuizModal';

type VideoRow = {
  id: string;
  title: string;
  description?: string | null;
  s3Bucket?: string;
  s3Key?: string;
  durationSec: number;
  createdAt: string;
  // hydrated meta
  likesCount?: number | null;
  commentsCount?: number | null;
  likedByMe?: boolean;
};

export default function MyVideos() {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));

  const [rows, setRows] = useState<VideoRow[]>([]);
  const [err, setErr] = useState<string>();
  const [openId, setOpenId] = useState<string | null>(null);
  const [openTitle, setOpenTitle] = useState<string>('');
  const [commentsOpenId, setCommentsOpenId] = useState<string | null>(null);
  const [quizOpenId, setQuizOpenId] = useState<string | null>(null);

  // keep like state snappy across list reloads
  const likeCacheRef = useRef<Map<string, { liked: boolean; count: number | null }>>(new Map());

  // helper: hydrate one video's server truth
  async function rehydrateOne(videoId: string) {
    try {
      const full = await VideosAPI.get(videoId);
      const serverLikes =
        typeof full?.likesCount === 'number'
          ? full.likesCount
          : typeof full?._count?.likes === 'number'
          ? full._count.likes
          : null;
      const serverComments =
        typeof full?.commentsCount === 'number'
          ? full.commentsCount
          : typeof full?._count?.comments === 'number'
          ? full._count.comments
          : null;
      const serverLiked = !!full?.likedByMe;

      likeCacheRef.current.set(videoId, { liked: serverLiked, count: serverLikes });

      setRows(prev =>
        prev.map(r =>
          r.id === videoId
            ? {
                ...r,
                likesCount: serverLikes,
                commentsCount: serverComments,
                likedByMe: serverLiked,
              }
            : r
        )
      );
    } catch {
      // ignore
    }
  }

  // Initial load + background hydration
  useEffect(() => {
    (async () => {
      try {
        setErr(undefined);
        const data = await VideosAPI.listMine();
        setRows(data);

        data.forEach((v: any) => {
          // background hydrate
          rehydrateOne(v.id);
        });
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load videos');
      }
    })();
  }, []);

  function onPlay(v: VideoRow) {
    setOpenTitle(v.title);
    setOpenId(v.id);
  }

  async function onDelete(id: string) {
    try {
      setErr(undefined);
      await VideosAPI.delete(id);
      setRows(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Delete failed');
    }
  }

  async function toggleLike(videoId: string) {
    const row = rows.find(r => r.id === videoId);
    if (!row) return;

    const wantLike = !row.likedByMe;
    const nextCount =
      typeof row.likesCount === 'number' ? row.likesCount + (wantLike ? 1 : -1) : null;

    // optimistic update + cache
    setRows(prev =>
      prev.map(r =>
        r.id === videoId ? { ...r, likedByMe: wantLike, likesCount: nextCount } : r
      )
    );
    likeCacheRef.current.set(videoId, { liked: wantLike, count: nextCount });

    try {
      if (wantLike) await VideosAPI.like(videoId);
      else await VideosAPI.unlike(videoId);

      // authoritative truth
      await rehydrateOne(videoId);
    } catch {
      // revert on error
      const reverted =
        typeof row.likesCount === 'number' ? row.likesCount + (wantLike ? -1 : 1) : null;
      setRows(prev =>
        prev.map(r =>
          r.id === videoId
            ? { ...r, likedByMe: !wantLike, likesCount: reverted }
            : r
        )
      );
      likeCacheRef.current.set(videoId, { liked: !wantLike, count: reverted });
    }
  }

  async function onCommentsClose() {
    const id = commentsOpenId;
    setCommentsOpenId(null);
    if (id) await rehydrateOne(id);
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6">My Videos</Typography>
      {err && <Alert severity="error">{err}</Alert>}

      <Grid container spacing={2}>
        {rows.map((v) => (
          <Grid item xs={12} sm={6} md={4} key={v.id}>
            <Card
              variant="outlined"
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardActionArea onClick={() => onPlay(v)} sx={{ flexGrow: 0 }}>
                <CardHeader
                  title={<Typography noWrap title={v.title}>{v.title}</Typography>}
                  subheader={`${Math.round(v.durationSec)}s • ${new Date(v.createdAt).toLocaleDateString()}`}
                  sx={{ pb: 0 }}
                />
                <CardContent sx={{ pt: 1 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {v.description || ' '}
                  </Typography>
                </CardContent>
              </CardActionArea>

              <CardActions
                sx={{
                  mt: 'auto',
                  px: 1,
                  pb: downSm ? 1 : 2,
                  pt: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Tooltip title={v.likedByMe ? 'Unlike' : 'Like'}>
                    <Badge
                      color="error"
                      badgeContent={typeof v.likesCount === 'number' ? v.likesCount : undefined}
                    >
                      <IconButton
                        size={downSm ? 'small' : 'medium'}
                        onClick={() => toggleLike(v.id)}
                        sx={{ color: v.likedByMe ? '#ff3b5c' : 'inherit' }}
                      >
                        <FavoriteBorderIcon />
                      </IconButton>
                    </Badge>
                  </Tooltip>

                  <Tooltip title="Comments">
                    <Badge
                      color="primary"
                      badgeContent={
                        typeof v.commentsCount === 'number' ? v.commentsCount : undefined
                      }
                    >
                      <IconButton
                        size={downSm ? 'small' : 'medium'}
                        onClick={() => setCommentsOpenId(v.id)}
                      >
                        <ChatBubbleOutlineIcon />
                      </IconButton>
                    </Badge>
                  </Tooltip>

                  <Tooltip title="Take quiz">
                    <IconButton
                      size={downSm ? 'small' : 'medium'}
                      onClick={() => setQuizOpenId(v.id)}
                    >
                      <QuizOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Tooltip title="Play">
                    <IconButton
                      aria-label="play"
                      size={downSm ? 'small' : 'medium'}
                      onClick={() => onPlay(v)}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      aria-label="delete"
                      size={downSm ? 'small' : 'medium'}
                      onClick={() => onDelete(v.id)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Player (starts UNMUTED) */}
      <VideoPlayerDialog
        open={!!openId}
        videoId={openId}
        title={openTitle}
        initialMuted={false}        // ← unmuted from first open
        onClose={() => setOpenId(null)}
        onOpenComments={(id) => setCommentsOpenId(id || openId)}
        onTakeQuiz={(id) => setQuizOpenId(id || openId)}
      />

      {/* Comments */}
      <CommentsDrawer
        open={!!commentsOpenId}
        onClose={onCommentsClose}
        videoId={commentsOpenId}
      />

      {/* Quiz (standalone/practice or course-aware, same component as FYP) */}
      <QuizModal
        open={!!quizOpenId}
        onClose={() => setQuizOpenId(null)}
        videoId={quizOpenId}
        onGoToCourse={() => setQuizOpenId(null)}
      />
    </Stack>
  );
}
