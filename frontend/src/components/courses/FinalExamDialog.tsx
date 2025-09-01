//FinalExamDialog.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import QuizBuilder, {
  type QuizBuilderValue,
  type QuizQuestion,
} from '../QuizBuilder';
import { CoursesAPI } from '../../services/api';

function blankQuestion(): QuizQuestion {
  return {
    text: '',
    options: [{ text: '', correct: true }, { text: '' }],
  };
}

export default function FinalExamDialog({
  open,
  onClose,
  courseId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  onSaved?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>();
  const [title, setTitle] = useState('Final Exam');
  const [value, setValue] = useState<QuizBuilderValue>({ questions: [blankQuestion(), blankQuestion(), blankQuestion()] });

  // Load any existing final exam (if backend returns learner-safe quiz, we map without correctness)
  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      setErr(undefined);
      try {
        const data = await CoursesAPI.getFinal(courseId).catch(() => null);
        if (data?.quiz) {
          setTitle(data.quiz.title || 'Final Exam');
          // Map into builder shape; mark the first option as correct by default (author can tweak)
          const qs: QuizQuestion[] = (data.quiz.questions || []).map((q: any) => ({
            text: q.text,
            options: (q.options || []).map((o: any, idx: number) => ({
              text: o.text,
              correct: idx === 0, // no correctness info on public API
            })),
          }));
          setValue({ questions: qs.length ? qs : [blankQuestion(), blankQuestion(), blankQuestion()] });
        } else {
          setTitle('Final Exam');
          setValue({ questions: [blankQuestion(), blankQuestion(), blankQuestion()] });
        }
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load final exam');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, courseId]);

  const validationError = useMemo(() => {
    const qs = value.questions || [];
    if (qs.length < 3) return 'At least 3 questions are required';
    for (const q of qs) {
      if (!q.text.trim()) return 'All questions need text';
      const opts = q.options || [];
      if (opts.length < 2) return 'Each question must have at least 2 options';
      const corrects = opts.filter((o) => o.correct === true).length;
      if (corrects !== 1) return 'Each question must have exactly one correct option';
      for (const o of opts) {
        if (!o.text.trim()) return 'All options need text';
      }
    }
    if (!title.trim()) return 'Final exam title is required';
    return null;
  }, [value, title]);

  async function onSave() {
    if (validationError) {
      setErr(validationError);
      return;
    }
    setErr(undefined);
    setSaving(true);
    try {
      await CoursesAPI.upsertFinal(courseId, {
        title: title.trim(),
        questions: value.questions.map((q) => ({
          text: q.text.trim(),
          options: q.options.map((o) => ({
            text: o.text.trim(),
            isCorrect: !!o.correct,
          })),
        })),
      });
      onSaved?.();
      onClose();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Final Exam</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {err && <Alert severity="error">{err}</Alert>}
          <TextField
            label="Exam title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            disabled={loading}
          />
          <QuizBuilder value={value} onChange={setValue} />
          {validationError && (
            <Alert severity="info">{validationError}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={onSave} disabled={saving || loading}>
          Save Final Exam
        </Button>
      </DialogActions>
    </Dialog>
  );
}
