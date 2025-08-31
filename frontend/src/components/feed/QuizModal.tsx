// src/components/fyp/QuizModal.tsx
import { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel,
  Radio, RadioGroup, Stack, Typography, Alert
} from '@mui/material';
import { VideosAPI } from '../../services/api';

type QA = { questionId: string; selectedOptionId: string };

type Props = {
  open: boolean;
  onClose: () => void;
  videoId: string | null;
  onGoToCourse?: (sectionId: string) => void;

  /** When provided (course section flow), use this to submit answers instead of VideosAPI.submitQuiz */
  onSubmitAnswers?: (answers: QA[]) => Promise<any>;
  /** Called after successful submit in section flow (e.g., auto-advance) */
  onSuccess?: () => void;
};

export default function QuizModal({
  open, onClose, videoId, onGoToCourse, onSubmitAnswers, onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<any | null>(null);
  const [section, setSection] = useState<{ id: string; chapterId: string } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; maxScore: number; passed: boolean } | null>(null);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    if (!open || !videoId) return;
    setQuiz(null); setSection(null); setAnswers({}); setResult(null); setErr(undefined);
    (async () => {
      setLoading(true);
      try {
        const data = await VideosAPI.getQuiz(videoId);
        setQuiz(data.quiz);
        setSection(data.section);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load quiz');
      } finally { setLoading(false); }
    })();
  }, [open, videoId]);

  async function onSubmit() {
    if (!videoId || !quiz) return;
    setErr(undefined);
    const payload: QA[] = Object.entries(answers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId }));
    try {
      if (onSubmitAnswers) {
        await onSubmitAnswers(payload);     // section flow
        setResult({ score: payload.length, maxScore: payload.length, passed: true }); // simple success state
        onSuccess?.();
      } else {
        const r = await VideosAPI.submitQuiz(videoId, payload); // standalone video flow
        setResult(r);
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Submit failed');
    }
  }

  const disabled = !!section && !quiz; // just in case
  const showGoToCourseBanner = !!section && !onSubmitAnswers; // only show if not in section flow override

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Quiz</DialogTitle>
      <DialogContent dividers>
        {loading && <Typography>Loading…</Typography>}
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        {showGoToCourseBanner && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This video belongs to a course section. To record course progress, take the quiz from the course page.
            <Button sx={{ ml: 1 }} size="small" onClick={() => onGoToCourse?.(section!.id)}>Go to course</Button>
          </Alert>
        )}

        {!loading && quiz && !result && (
          <Stack spacing={2}>
            <Typography variant="subtitle1">{quiz.title}</Typography>
            {quiz.questions.map((q: any, i: number) => (
              <Box key={q.id} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography sx={{ mb: .5 }}><b>Q{i + 1}.</b> {q.text}</Typography>
                <RadioGroup
                  value={answers[q.id] || ''}
                  onChange={(_, val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                >
                  {q.options.map((o: any) => (
                    <FormControlLabel key={o.id} value={o.id} control={<Radio />} label={o.text} />
                  ))}
                </RadioGroup>
              </Box>
            ))}
          </Stack>
        )}

        {result && (
          <Stack spacing={1}>
            <Alert severity={result.passed ? 'success' : 'info'}>
              Score: {result.score}/{result.maxScore} — {result.passed ? 'Passed!' : 'Keep practicing'}
            </Alert>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {!result && <Button onClick={onClose}>Close</Button>}
        {!result && quiz && <Button variant="contained" onClick={onSubmit} disabled={disabled}>Submit</Button>}
        {result && <Button variant="contained" onClick={onClose}>Done</Button>}
      </DialogActions>
    </Dialog>
  );
}
