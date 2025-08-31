import { useEffect, useMemo, useState } from 'react';
import { Alert, CircularProgress, Stack } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import SectionPlayer from '../../components/courses/SectionPlayer';
import { CoursesAPI } from '../../services/api';

export default function SectionPage() {
  const { id: courseId, sectionId } = useParams<{ id: string; sectionId: string }>();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    (async () => {
      if (!courseId || !sectionId) return;
      setLoading(true);
      setErr(undefined);
      try {
        const c = await CoursesAPI.getPublic(courseId);
        setCourse(c);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, sectionId]);

  const section = useMemo(() => {
    if (!course || !sectionId) return null;
    for (const ch of course.chapters ?? []) {
      const sec = (ch.sections ?? []).find((s: any) => s.id === sectionId);
      if (sec) return { sec, ch };
    }
    return null;
  }, [course, sectionId]);

  if (loading) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }
  if (err) return <Alert severity="error" sx={{ m: 2 }}>{err}</Alert>;
  if (!course || !section) return <Alert severity="warning" sx={{ m: 2 }}>Section not found.</Alert>;

  const { sec, ch } = section;

  return (
    <SectionPlayer
      courseTitle={course.title}
      chapterTitle={ch.title}
      section={sec}
      onBack={() => navigate(`/courses/${courseId}`)}
      onNext={() => {
        // pick next section in outline; if none, go back to course page
        const chapters = [...(course.chapters ?? [])].sort((a: any, b: any) => a.order - b.order);
        const sectionsFlat = chapters.flatMap((c: any) =>
          [...(c.sections ?? [])].sort((a: any, b: any) => a.order - b.order).map((s: any) => ({ s, c }))
        );
        const idx = sectionsFlat.findIndex(x => x.s.id === sec.id);
        const next = idx >= 0 ? sectionsFlat[idx + 1] : null;
        if (next) {
          navigate(`/courses/${courseId}/sections/${next.s.id}`, {
            state: { courseTitle: course.title, chapterTitle: next.c.title },
            replace: true,
          });
        } else {
          navigate(`/courses/${courseId}`);
        }
      }}
    />
  );
}
