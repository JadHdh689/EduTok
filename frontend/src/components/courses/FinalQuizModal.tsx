// src/components/courses/FinalQuizModal.tsx
import { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography,
  RadioGroup, FormControlLabel, Radio, Alert
} from '@mui/material';
import { CoursesAPI } from '../../services/api';

export default function FinalQuizModal({
  open, onClose, courseId, onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  onSubmitted?: (passed: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();
  const [quiz, setQuiz] = useState<{ id: string; title: string; questions: { id: string; text: string; options: { id: string; text: string }[] }[] } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; maxScore: number; passed: boolean } | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      setErr(undefined);
      setResult(null);
      setAnswers({});
      try {
        const data = await CoursesAPI.getFinal(courseId);
        setQuiz(data.quiz ?? null);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load final exam');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, courseId]);

  const canSubmit = !!quiz && quiz.questions.every(q => !!answers[q.id]);

  async function submit() {
    if (!quiz) return;
    try {
      const r = await CoursesAPI.submitFinal(courseId, quiz.questions.map(q => ({
        questionId: q.id,
        selectedOptionId: answers[q.id],
      })));
      setResult({ score: r.score, maxScore: r.maxScore, passed: r.passed });
      onSubmitted?.(r.passed);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Submit failed');
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{quiz?.title || 'Final Exam'}</DialogTitle>
      <DialogContent dividers>
        {loading && <Typography variant="body2">Loading…</Typography>}
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        {result ? (
          <Alert severity={result.passed ? 'success' : 'warning'}>
            Score: {result.score}/{result.maxScore} — {result.passed ? 'Passed' : 'Try again'}
          </Alert>
        ) : quiz ? (
          <Stack spacing={2}>
            {quiz.questions.map((q, i) => (
              <Box key={q.id} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography sx={{ mb: .5 }}><b>Q{i+1}.</b> {q.text}</Typography>
                <RadioGroup
                  value={answers[q.id] || ''}
                  onChange={(_, val) => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                >
                  {q.options.map(o => (
                    <FormControlLabel key={o.id} value={o.id} control={<Radio />} label={o.text} />
                  ))}
                </RadioGroup>
              </Box>
            ))}
          </Stack>
        ) : (!loading && !err) ? (
          <Typography variant="body2" color="text.secondary">No final exam yet.</Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        {!result && <Button onClick={onClose}>Close</Button>}
        {!result && quiz && <Button variant="contained" onClick={submit} disabled={!canSubmit}>Submit</Button>}
        {result && <Button variant="contained" onClick={onClose}>Done</Button>}
      </DialogActions>
    </Dialog>
  );
}
