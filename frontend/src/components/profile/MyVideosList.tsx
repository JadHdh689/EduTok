//src/components/profile/MyVideosList.tsx
import { useEffect, useState } from 'react';
import {
  Alert, Card, CardActions, CardContent, CardHeader, IconButton, Stack, Typography
} from '@mui/material';
import Grid from '@mui/material/Grid'; // Grid v2
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VideoPlayerDialog from '../video/VideoPlayerDialog'; // <-- correct path!
import { VideosAPI } from '../../services/api';

type VideoRow = {
  id: string;
  title: string;
  description?: string | null;
  durationSec: number;
  createdAt: string;
};

export default function MyVideosList() {
  const [rows, setRows] = useState<VideoRow[]>([]);
  const [err, setErr] = useState<string>();
  const [openId, setOpenId] = useState<string | null>(null);
  const [openTitle, setOpenTitle] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const data = await VideosAPI.listMine();
        setRows(data);
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
      if ((VideosAPI as any).delete) {
        await (VideosAPI as any).delete(id);
        setRows(prev => prev.filter(r => r.id !== id));
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Delete failed');
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6">My Videos</Typography>
      {err && <Alert severity="error">{err}</Alert>}

      <Grid container spacing={2}>
        {rows.map((v) => (
          <Grid key={v.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardHeader
                title={<Typography noWrap>{v.title}</Typography>}
                subheader={new Date(v.createdAt).toLocaleString()}
                sx={{ pb: 0 }}
              />
              <CardContent sx={{ pt: 1 }}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {v.description || ' '}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Duration: {Math.round(v.durationSec)}s
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <IconButton aria-label="play" onClick={() => onPlay(v)}>
                  <PlayArrowIcon />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => onDelete(v.id)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <VideoPlayerDialog
        open={!!openId}
        videoId={openId}
        title={openTitle}
        onClose={() => setOpenId(null)}
        onOpenComments={(id) => console.log('comments for', id)}
        onTakeQuiz={(id) => console.log('quiz for', id)}
      />
    </Stack>
  );
}
