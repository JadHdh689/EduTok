// components/profile/MyCoursesList.tsx
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { CoursesAPI } from '../../services/api';

type CourseCard = {
  id: string;
  title: string;
  createdAt: string;
  description?: string | null;
  published: boolean;
  coverImageUrl?: string | null;
  category?: { id: number; name: string } | null;
  _count?: { enrollments?: number };
};

export default function MyCoursesList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(undefined);
    try {
      const list = await CoursesAPI.listMine();
      setItems(list as CourseCard[]);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function togglePublish(id: string, published: boolean) {
    setBusyId(id);
    setErr(undefined);
    setItems((prev) => prev.map(c => c.id === id ? { ...c, published: !published } : c));
    try {
      await CoursesAPI.setPublished(id, !published);
    } catch (e: any) {
      setItems((prev) => prev.map(c => c.id === id ? { ...c, published } : c));
      setErr(e?.response?.data?.message || e.message || 'Publish change failed');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this course? This action cannot be undone.')) return;
    setBusyId(id);
    setErr(undefined);
    const prev = items;
    setItems((p) => p.filter(c => c.id !== id));
    try {
      await CoursesAPI.deleteCourse(id);
    } catch (e: any) {
      setItems(prev);
      setErr(e?.response?.data?.message || e.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={20} />
        <Typography variant="body2">Loading…</Typography>
      </Stack>
    );
  }

  return (
    <Box>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">My Courses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/profile/courses/new')}
        >
          New course
        </Button>
      </Stack>

      {!items.length ? (
        <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
          <Typography variant="body2">No courses yet.</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/profile/courses/new')}
          >
            Create your first course
          </Button>
        </Stack>
      ) : (
        <Grid container spacing={2}>
          {items.map((c) => (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                  title={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" noWrap>{c.title}</Typography>
                      <Chip
                        size="small"
                        label={c.published ? 'Published' : 'Draft'}
                        color={c.published ? 'success' : 'default'}
                        variant="filled"
                      />
                    </Stack>
                  }
                  subheader={new Date(c.createdAt).toLocaleString()}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {c.description || '—'}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {c.category?.name && (
                        <Chip size="small" label={c.category.name} variant="outlined" />
                      )}
                      {typeof c._count?.enrollments === 'number' && (
                        <Chip size="small" label={`${c._count.enrollments} enrolled`} />
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
                <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/profile/courses/${c.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Box sx={{ flex: 1 }} />
                  <Tooltip title={c.published ? 'Unpublish' : 'Publish'}>
                    <span>
                      <IconButton
                        onClick={() => togglePublish(c.id, c.published)}
                        disabled={busyId === c.id}
                      >
                        {c.published ? <UnpublishedIcon /> : <PublishIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <span>
                      <IconButton
                        color="error"
                        onClick={() => remove(c.id)}
                        disabled={busyId === c.id}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
