// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/profile/MyCoursesList.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import {
  Card, CardContent, CardHeader, Chip, Grid, Typography
} from '@mui/material';
import { CoursesAPI } from '../../services/api';

export default function MyCoursesList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    (async ()=>{
      try {
        const list = await CoursesAPI.listMine();
        setItems(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Typography variant="body2">Loading…</Typography>;
  if (!items.length) return <Typography variant="body2">No courses yet.</Typography>;

  return (
    <Grid container spacing={2}>
      {items.map(c => (
        <Grid item xs={12} sm={6} key={c.id}>
          <Card variant="outlined">
            <CardHeader
              title={c.title}
              subheader={new Date(c.createdAt).toLocaleString()}
              action={<Chip size="small" label={c.published ? 'Published' : 'Draft'} color={c.published ? 'success' : 'default'} />}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {c.description || '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
