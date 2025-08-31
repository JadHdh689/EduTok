// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/profile/MyVideosList.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, CardHeader, Grid, Typography, Chip
} from '@mui/material';
import { VideosAPI } from '../../services/api';

export default function MyVideosList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    (async ()=>{
      try {
        const list = await VideosAPI.listMine();
        setItems(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Typography variant="body2">Loading…</Typography>;
  if (!items.length) return <Typography variant="body2">No videos yet. Upload your first one!</Typography>;

  return (
    <Grid container spacing={2}>
      {items.map(v => (
        <Grid item xs={12} sm={6} key={v.id}>
          <Card variant="outlined">
            <CardHeader
              title={v.title}
              subheader={new Date(v.createdAt).toLocaleString()}
              action={<Chip size="small" label={v.category?.name || 'Category'} />}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">{v.description || '—'}</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption">Duration: {v.durationSec}s</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
