import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinearProgress from '@mui/material/LinearProgress';
import { useNavigate, useParams } from 'react-router-dom';
import { CoursesAPI } from '../../services/api';
import FinalQuizModal from '../../components/courses/FinalQuizModal';

export default function CoursePublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();
  const [enrolled, setEnrolled] = useState(false);
  const [finalOpen, setFinalOpen] = useState(false);

  const [progress, setProgress] = useState<{
    enrollment: null | {
      id: string;
      status: 'IN_PROGRESS' | 'COMPLETED';
      progressPct: number;
    };
    sections: Array<{ sectionId: string; completedAt: string | null; score?: number | null; maxScore?: number | null }>;
    final?: { available: boolean; attempted?: boolean; passed?: boolean };
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      setErr(undefined);
      try {
        const [c, prog] = await Promise.all([
          CoursesAPI.getPublic(id),
          CoursesAPI.getProgress(id).catch(() => null), // not logged in is fine
        ]);
        setCourse(c);
        setEnrolled(!!prog?.enrollment);
        setProgress(
          prog
            ? {
                enrollment: prog.enrollment,
                sections: prog.sections || [],
                final: prog.final,
              }
            : null
        );
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function reloadProgress() {
    if (!id) return;
    try {
      const prog = await CoursesAPI.getProgress(id).catch(() => null);
      setEnrolled(!!prog?.enrollment);
      setProgress(
        prog
          ? {
              enrollment: prog.enrollment,
              sections: prog.sections || [],
              final: prog.final,
            }
          : null
      );
    } catch {
      // ignore
    }
  }

  async function enroll() {
    if (!id) return;
    try {
      await CoursesAPI.enroll(id);
      setEnrolled(true);
      await reloadProgress();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e.message || 'Enroll failed';
      if (/already/i.test(msg) || e?.response?.status === 409) {
        setEnrolled(true);
        await reloadProgress();
      } else {
        alert(msg);
      }
    }
  }

  const first = useMemo(
    () => course?.chapters?.[0]?.sections?.[0] ?? null,
    [course]
  );

  const completedIds = useMemo(
    () =>
      new Set(
        (progress?.sections || [])
          .filter((s) => s.completedAt)
          .map((s) => s.sectionId)
      ),
    [progress]
  );

  const firstIncomplete = useMemo(() => {
    if (!course?.chapters?.length) return null;
    const chapters = (course.chapters || []).slice().sort((a: any, b: any) => a.order - b.order);
    for (const ch of chapters) {
      const secs = (ch.sections || []).slice().sort((a: any, b: any) => a.order - b.order);
      for (const s of secs) {
        if (!completedIds.has(s.id)) return s;
      }
    }
    return chapters[0]?.sections?.[0] ?? null;
  }, [course, completedIds]);

  const finalQuiz = useMemo(
    () =>
      (course?.quizzes || []).find((q: any) =>
        String(q?.title || '').toLowerCase().includes('final')
      ),
    [course]
  );

  function startSection(sec: any) {
    if (!id) return;
    navigate(`/courses/${id}/sections/${sec.id}`, {
      state: {
        courseTitle: course?.title,
        chapterTitle:
          course?.chapters?.find((ch: any) => ch.sections?.some((s: any) => s.id === sec.id))
            ?.title ?? '',
      },
    });
  }

  function openFinal() {
    setFinalOpen(true);
  }

  function openAuthorProfile() {
    const username = course?.author?.username;
    if (!username) return;
    navigate(`/u/${username}`);
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

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1, cursor: course.author?.username ? 'pointer' : 'default' }}
            onClick={openAuthorProfile}
            title={course.author?.username ? `View @${course.author.username}` : undefined}
          >
            <Avatar sx={{ width: 28, height: 28 }}>
              {(course.author.displayName || course.author.username || '?')[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>
              {course.author.displayName || course.author.username}
            </Typography>
            <Chip size="small" label={course.category?.name ?? 'General'} />
          </Stack>

          {!!progress?.enrollment && (
            <Stack spacing={0.5} sx={{ mb: 2, maxWidth: 420 }}>
              <Typography variant="caption" color="text.secondary">
                Progress: {progress.enrollment.progressPct}%
                {progress.enrollment.status === 'COMPLETED' ? ' • Completed' : ''}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress.enrollment.progressPct}
              />
            </Stack>
          )}

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
                onClick={() => (firstIncomplete || first) && startSection(firstIncomplete || first)}
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
            {finalQuiz && (
              <Button
                variant="outlined"
                onClick={openFinal}
                disabled={!enrolled}
                title={enrolled ? 'Open final exam' : 'Enroll to take the final'}
              >
                Final Exam
              </Button>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Curriculum</Typography>
          <Stack spacing={2}>
            {(course.chapters || [])
              .slice()
              .sort((a: any, b: any) => a.order - b.order)
              .map((ch: any) => (
                <Box key={ch.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2">{ch.order}. {ch.title}</Typography>
                  </Box>
                  <Stack sx={{ p: 1 }}>
                    {(ch.sections || [])
                      .slice()
                      .sort((a: any, b: any) => a.order - b.order)
                      .map((sec: any) => {
                        const state = (progress?.sections || []).find(s => s.sectionId === sec.id);
                        const done = !!state?.completedAt;
                        return (
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
                            <Stack direction="row" spacing={1} alignItems="center">
                              {done && (
                                <Chip
                                  size="small"
                                  color="success"
                                  icon={<CheckCircleIcon />}
                                  label="Completed"
                                />
                              )}
                              <Button size="small" onClick={() => startSection(sec)}>
                                {done ? 'Review' : 'Open'}
                              </Button>
                            </Stack>
                          </Stack>
                        );
                      })}
                  </Stack>
                </Box>
              ))}

            {finalQuiz && (
              <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="subtitle2">Final Exam</Typography>
                </Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
                  <Typography variant="body2" noWrap>
                    {finalQuiz.title || 'Final Exam'}
                  </Typography>
                  <Button size="small" onClick={openFinal} disabled={!enrolled}>
                    Open
                  </Button>
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>

      {id && (
        <FinalQuizModal
          open={finalOpen}
          onClose={() => setFinalOpen(false)}
          courseId={id}
          onSubmitted={async () => {
            // Do NOT auto-close; let users review answers until they hit "Done"
            await reloadProgress();
          }}
        />
      )}
    </Box>
  );
}
