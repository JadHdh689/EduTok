import { useEffect, useState } from 'react';
import {
  Alert, Box, Card, CardActionArea, CardContent, Dialog, DialogContent,
  Grid, Stack, Typography
} from '@mui/material';
import { VideosAPI, UploadsAPI } from '../../services/api';

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
  const [open, setOpen] = useState(false);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [current, setCurrent] = useState<VideoRow | null>(null);

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

  async function onOpenVideo(v: VideoRow) {
    try {
      setErr(undefined);
      setCurrent(v);
      // EITHER call the generic uploads endpoint by key:
      const signed = await UploadsAPI.signGetByKey(v.s3Key, 900);
      // OR use the stricter endpoint:
      // const signed = await VideosAPI.streamUrl(v.id);
      setPlayUrl(signed.url);
      setOpen(true);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Failed to get video URL');
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
              <CardActionArea onClick={() => onOpenVideo(v)}>
                <CardContent>
                  <Typography variant="subtitle1" noWrap>{v.title}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {v.description || ' '}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {v.durationSec}s
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogContent>
          {playUrl ? (
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {current?.title}
              </Typography>
              <video controls style={{ width: '100%', maxHeight: 520 }} src={playUrl} />
            </Box>
          ) : (
            <Typography>Loading…</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
