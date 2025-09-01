import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { CoursesAPI, VideosAPI } from '../../services/api';

type QuizData =
  | null
  | {
      quiz: {
        id: string;
        title: string;
        questions: { id: string; text: string; options: { id: string; text: string }[] }[];
      } | null;
      section: null | {
        id: string;
        chapterId: string;
        courseId: string;
        courseTitle: string;
      };
      sectionsCount?: number;
    };

export default function QuizModal({
  open,
  onClose,
  videoId,
  onGoToCourse,
}: {
  open: boolean;
  onClose: () => void;
  videoId: string | null;
  onGoToCourse?: (sectionId: string, courseId: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();
  const [data, setData] = useState<QuizData>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<
    | null
    | {
        attemptId: string;
        score: number;
        maxScore: number;
        passed: boolean;
        answers?: Array<{
          questionId: string;
          selectedOptionId: string;
          correctOptionId: string;
          isCorrect: boolean;
        }>;
        completedSection?: boolean;
        progressPct?: number;
      }
  >(null);

  useEffect(() => {
    if (!open || !videoId) return;
    setLoading(true);
    setErr(undefined);
    setData(null);
    setResult(null);
    setAnswers({});
    (async () => {
      try {
        const q = await VideosAPI.getQuiz(videoId);
        setData(q);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, videoId]);

  const quiz = data?.quiz || null;
  const hasSection = !!data?.section;

  const canSubmit = useMemo(
    () => !!quiz && quiz.questions.every((q) => !!answers[q.id]),
    [quiz, answers]
  );

  async function submit() {
    if (!quiz || !videoId) return;

    const payload = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answers[q.id],
    }));

    try {
      setErr(undefined);
      setLoading(true);

      if (hasSection && data?.section?.id) {
        // Always record to course progress for section videos
        const r = await CoursesAPI.submitSectionQuiz(data.section.id, payload);
        setResult({
          attemptId: r.attemptId,
          score: r.score,
          maxScore: r.maxScore,
          passed: r.score >= r.maxScore / 2,
          answers: r.answers,
          completedSection: r.completedSection,
          progressPct: r.progressPct,
        });
      } else {
        // Standalone video quiz (practice is fine)
        const r = await VideosAPI.submitQuiz(videoId, payload);
        setResult({
          attemptId: r.attemptId,
          score: r.score,
          maxScore: r.maxScore,
          passed: r.passed,
          answers: r.answers,
        });
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Submit failed');
    } finally {
      setLoading(false);
    }
  }

  const answerDetail = useMemo(() => {
    const map = new Map<string, { selected?: string; correct?: string; isCorrect?: boolean }>();
    (result?.answers || []).forEach((a) =>
      map.set(a.questionId, {
        selected: a.selectedOptionId,
        correct: a.correctOptionId,
        isCorrect: a.isCorrect,
      })
    );
    return map;
  }, [result]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {quiz?.title || 'Quiz'}
        {hasSection && (
          <Typography variant="subtitle2" color="text.secondary">
            This quiz belongs to <b>{data?.section?.courseTitle || 'a course'}</b>
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {loading && <Typography variant="body2">Loading…</Typography>}
        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}

        {!loading && hasSection && !result && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This video belongs to a course section. Your answers will be recorded to your{' '}
            <b>course progress</b>. For the full course flow (enroll, next sections, etc.), open the
            section.
            <Box sx={{ mt: 1 }}>
            </Box>
          </Alert>
        )}

        {!loading && !quiz && !err && (
          <Typography variant="body2" color="text.secondary">
            No quiz found for this video.
          </Typography>
        )}

        {!loading && quiz && !result && (
          <Stack spacing={2}>
            {quiz.questions.map((q, i) => (
              <Box
                key={q.id}
                sx={{
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography sx={{ mb: 0.5 }}>
                  <b>Q{i + 1}.</b> {q.text}
                </Typography>
                <RadioGroup
                  value={answers[q.id] || ''}
                  onChange={(_, val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                >
                  {q.options.map((o) => (
                    <FormControlLabel
                      key={o.id}
                      value={o.id}
                      control={<Radio />}
                      label={o.text}
                    />
                  ))}
                </RadioGroup>
              </Box>
            ))}
          </Stack>
        )}

        {result && quiz && (
          <Stack spacing={2}>
            <Alert severity={result.passed ? 'success' : 'warning'}>
              Score: {result.score}/{result.maxScore}
              {typeof result.progressPct === 'number' && <> • Course progress: {result.progressPct}%</>}
              {result.completedSection && ' • Section completed'}
            </Alert>

            <Typography variant="subtitle1">Review</Typography>
            {quiz.questions.map((q, i) => {
              const det = answerDetail.get(q.id);
              return (
                <Box
                  key={q.id}
                  sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Typography>
                      <b>Q{i + 1}.</b> {q.text}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    {q.options.map((o) => {
                      const isSelected = det?.selected === o.id;
                      const isCorrect = det?.correct === o.id;
                      const bg = isCorrect
                        ? 'success.light'
                        : isSelected
                        ? 'error.light'
                        : undefined;
                      const borderColor = isCorrect
                        ? 'success.main'
                        : isSelected
                        ? 'error.main'
                        : 'divider';
                      return (
                        <Box
                          key={o.id}
                          sx={{
                            p: 1,
                            border: '1px solid',
                            borderColor,
                            bgcolor: bg,
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2">
                            {o.text} {isCorrect ? '✓' : isSelected ? '✗' : ''}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              );
            })}
            <Typography variant="caption" color="text.secondary">
              Legend: ✓ correct • ✗ your choice (if incorrect)
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        {!result && <Button onClick={onClose}>Close</Button>}
        {!result && quiz && (
          <Button variant="contained" onClick={submit} disabled={!canSubmit || loading}>
            Submit
          </Button>
        )}
        {result && <Button variant="contained" onClick={onClose}>Done</Button>}
      </DialogActions>
    </Dialog>
  );
}
