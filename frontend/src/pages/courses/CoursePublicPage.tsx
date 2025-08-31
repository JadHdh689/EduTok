import { useEffect, useState, useMemo } from 'react';
import {
  Box, Button, Chip, Divider, Stack, Typography, Avatar, CircularProgress, Alert, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate, useParams } from 'react-router-dom';
import { CoursesAPI } from '../../services/api';

export default function CoursePublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      setErr(undefined);
      try {
        const [c, progress] = await Promise.all([
          CoursesAPI.getPublic(id),
          CoursesAPI.getProgress(id).catch(() => null), // not logged in? fine.
        ]);
        setCourse(c);
        setEnrolled(!!progress?.enrollment);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function enroll() {
    if (!id) return;
    try {
      await CoursesAPI.enroll(id);
      setEnrolled(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e.message || 'Enroll failed';
      if (/already/i.test(msg) || e?.response?.status === 409) setEnrolled(true);
      else alert(msg);
    }
  }

  const first = useMemo(
    () => course?.chapters?.[0]?.sections?.[0] ?? null,
    [course]
  );

  function startSection(sec: any) {
    if (!id) return;
    navigate(`/courses/${id}/sections/${sec.id}`, {
      state: {
        courseTitle: course?.title,
        // If your section player wants this, pass chapter title from the outline:
        chapterTitle:
          course?.chapters?.find((ch: any) => ch.sections?.some((s: any) => s.id === sec.id))?.title ?? '',
      },
    });
  }

  if (loading) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
        <CircularProgress />
        <Typography variant="body2">Loading…</Typography>
      </Stack>
    );
  }
  if (err) return <Alert severity="error" sx={{ m: 2 }}>{err}</Alert>;
  if (!course) return null;

  return (
    <Box sx={{ px: 2, py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Course</Typography>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              height: 220,
              borderRadius: 1,
              bgcolor: 'grey.100',
              backgroundImage: course.coverImageUrl ? `url(${course.coverImageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mb: 2,
            }}
          />
          <Typography variant="h5" sx={{ mb: 1 }}>{course.title}</Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Avatar sx={{ width: 28, height: 28 }}>
              {(course.author.displayName || course.author.username || '?')[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {course.author.displayName || course.author.username}
            </Typography>
            <Chip size="small" label={course.category?.name ?? 'General'} />
          </Stack>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {course.description || '—'}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {!enrolled ? (
              <Button variant="contained" onClick={enroll}>Enroll</Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => first && startSection(first)}
              >
                Continue
              </Button>
            )}
            {first && (
              <Button
                variant="outlined"
                startIcon={<PlayArrowIcon />}
                onClick={() => startSection(first)}
              >
                Start learning
              </Button>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Curriculum</Typography>
          <Stack spacing={2}>
            {course.chapters
              .slice()
              .sort((a: any, b: any) => a.order - b.order)
              .map((ch: any) => (
                <Box key={ch.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2">{ch.order}. {ch.title}</Typography>
                  </Box>
                  <Stack sx={{ p: 1 }}>
                    {ch.sections
                      .slice()
                      .sort((a: any, b: any) => a.order - b.order)
                      .map((sec: any) => (
                        <Stack
                          key={sec.id}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ p: 1, borderRadius: 1, '&:hover': { bgcolor: 'grey.50' } }}
                        >
                          <Typography variant="body2" noWrap>
                            {ch.order}.{sec.order} — {sec.title} · {sec.video.durationSec}s
                          </Typography>
                          <Button size="small" onClick={() => startSection(sec)}>Open</Button>
                        </Stack>
                      ))}
                  </Stack>
                </Box>
              ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
