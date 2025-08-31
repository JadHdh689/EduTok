import { useEffect, useState } from 'react';
import {
  Alert,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { VideosAPI } from '../../services/api';
import VideoPlayerDialog from '../video/VideoPlayerDialog';

type VideoRow = {
  id: string;
  title: string;
  description?: string | null;
  s3Bucket: string;
  s3Key: string;
  durationSec: number;
  createdAt: string;
};

export default function MyVideos() {
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
      await VideosAPI.delete(id); // add this small helper in your api if you don't have it yet
      setRows((prev) => prev.filter((r) => r.id !== id));
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
          <Grid item xs={12} sm={6} md={4} key={v.id}>
            <Card>
              <CardHeader
                title={<Typography noWrap>{v.title}</Typography>}
                subheader={`${Math.round(v.durationSec)}s`}
                sx={{ pb: 0 }}
              />
              <CardContent sx={{ pt: 1 }}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {v.description || ' '}
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
        onOpenComments={(id) => {
          // wire this to your comments UI if you have one
          console.log('open comments for', id);
        }}
        onTakeQuiz={(id) => {
          // navigate to your quiz page for this video, e.g.:
          // navigate(`/videos/${id}/quiz`);
          console.log('take quiz for', id);
        }}
      />
    </Stack>
  );
}
