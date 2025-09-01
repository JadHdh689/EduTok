import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { CoursesAPI } from '../../services/api';

export default function FinalQuizModal({
  open,
  onClose,
  courseId,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  onSubmitted?: (passed: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();
  const [quiz, setQuiz] = useState<{
    id: string;
    title: string;
    questions: { id: string; text: string; options: { id: string; text: string }[] }[];
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    attemptId: string;
    score: number;
    maxScore: number;
    passed: boolean;
    progressPct: number;
    answers?: Array<{ questionId: string; selectedOptionId: string; correctOptionId: string; isCorrect: boolean }>;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      setErr(undefined);
      setQuiz(null);
      setAnswers({});
      setResult(null);
      try {
        const q = await CoursesAPI.getFinal(courseId);
        setQuiz(q); // already normalized to quiz or null in API client
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load final');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, courseId]);

  const canSubmit = useMemo(
    () => !!quiz?.questions?.every((q) => !!answers[q.id]),
    [quiz, answers]
  );

  async function submit() {
    if (!quiz) return;
    try {
      const payload = quiz.questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id],
      }));
      const r = await CoursesAPI.submitFinal(courseId, payload);
      setResult(r);
      onSubmitted?.(!!r?.passed);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Submit failed');
    }
  }

  const answerDetail = useMemo(() => {
    const map = new Map<string, { selected?: string; correct?: string }>();
    (result?.answers || []).forEach((a) =>
      map.set(a.questionId, { selected: a.selectedOptionId, correct: a.correctOptionId })
    );
    return map;
  }, [result]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{quiz?.title || 'Final Exam'}</DialogTitle>
      <DialogContent dividers>
        {loading && <Typography variant="body2">Loading…</Typography>}
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        {result ? (
          <Stack spacing={2}>
            <Alert severity={result.passed ? 'success' : 'warning'}>
              Score: {result.score}/{result.maxScore} • {result.passed ? 'Passed' : 'Not passed'} • Course progress: {result.progressPct}%
            </Alert>

            {result.answers && quiz && (
              <Stack spacing={2}>
                <Typography variant="subtitle1">Review</Typography>
                {quiz.questions.map((q, i) => {
                  const det = answerDetail.get(q.id);
                  return (
                    <Box key={q.id} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Typography><b>Q{i + 1}.</b> {q.text}</Typography>
                        {det?.correct && det?.selected && (
                          <Chip
                            size="small"
                            color={det.selected === det.correct ? 'success' : 'error'}
                            label={det.selected === det.correct ? 'Correct' : 'Incorrect'}
                          />
                        )}
                      </Stack>
                      <Stack spacing={0.5}>
                        {q.options.map((o) => {
                          const isSelected = det?.selected === o.id;
                          const isCorrect = det?.correct === o.id;
                          return (
                            <Box
                              key={o.id}
                              sx={{
                                p: 1,
                                border: '1px solid',
                                borderColor: isCorrect ? 'success.main' : isSelected ? 'error.main' : 'divider',
                                bgcolor: isCorrect ? 'success.light' : isSelected ? 'error.light' : undefined,
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
          </Stack>
        ) : quiz ? (
          <Stack spacing={2}>
            {quiz.questions.map((q, i) => (
              <Box key={q.id} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography sx={{ mb: 0.5 }}><b>Q{i + 1}.</b> {q.text}</Typography>
                <RadioGroup
                  value={answers[q.id] || ''}
                  onChange={(_, val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                >
                  {q.options.map((o) => (
                    <FormControlLabel key={o.id} value={o.id} control={<Radio />} label={o.text} />
                  ))}
                </RadioGroup>
              </Box>
            ))}
          </Stack>
        ) : !loading && !err ? (
          <Typography variant="body2" color="text.secondary">No final exam found.</Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        {!result && <Button onClick={onClose}>Close</Button>}
        {!result && quiz && (
          <Button variant="contained" onClick={submit} disabled={!canSubmit}>Submit</Button>
        )}
        {result && <Button variant="contained" onClick={onClose}>Done</Button>}
      </DialogActions>
    </Dialog>
  );
}
