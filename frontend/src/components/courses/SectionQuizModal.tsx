// ───────────────────────────────────────────────────────────────
// FILE: src/components/courses/SectionQuizModal.tsx
// ───────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from '@mui/material';
import { CoursesAPI, VideosAPI } from '../../services/api';

type Props = {
  open: boolean;
  onClose: () => void;
  videoUrl: string | null;
  section: any | null; // { id, title, video: { id } }
};

export default function SectionQuizModal({ open, onClose, videoUrl, section }: Props) {
  const vref = useRef<HTMLVideoElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [quiz, setQuiz] = useState<{
    id: string;
    questions: { id: string; text: string; options: { id: string; text: string }[] }[];
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string>();
  const [result, setResult] = useState<{
    attemptId: string;
    score: number;
    maxScore: number;
    progressPct: number;
    answers: {
      questionId: string;
      selectedOptionId: string;
      correctOptionId: string;
      isCorrect: boolean;
    }[];
  } | null>(null);

  // Load quiz for section video
  useEffect(() => {
    if (!open || !section?.video?.id) return;
    setQuiz(null);
    setResult(null);
    setAnswers({});
    setErr(undefined);
    (async () => {
      try {
        const data = await VideosAPI.getQuiz(section.video.id);
        if (data.quiz) {
          setQuiz({ id: data.quiz.id, questions: data.quiz.questions });
        } else {
          setQuiz(null);
        }
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load quiz');
        setQuiz(null);
      }
    })();
  }, [open, section?.video?.id]);

  // Play/pause handler
  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, videoUrl]);

  // Submit quiz → persist results
  async function submit() {
    if (!section?.id || !quiz) return;
    const payload = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answers[q.id],
    }));
    setSubmitting(true);
    try {
      const r = await CoursesAPI.submitSectionQuiz(section.id, payload);
      setResult({
        attemptId: r.attemptId,
        score: r.score,
        maxScore: r.maxScore,
        progressPct: r.progressPct,
        answers: r.answers,
      });
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = quiz && quiz.questions.every((q) => !!answers[q.id]);

  // map answers for review
  const answerDetail = useMemo(() => {
    const map = new Map<
      string,
      { selected?: string; correct?: string; isCorrect?: boolean }
    >();
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
      <DialogTitle>{section?.title ?? 'Section Quiz'}</DialogTitle>
      <DialogContent dividers>
        {videoUrl && (
          <Box sx={{ bgcolor: 'black', borderRadius: 1, overflow: 'hidden', mb: 2 }}>
            <Box
              onClick={() => setPaused((p) => !p)}
              sx={{
                height: 360,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <video
                key={videoUrl}
                ref={vref}
                src={videoUrl}
                autoPlay
                muted={false} // default unmuted
                playsInline
                preload="auto"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </Box>
          </Box>
        )}

        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}

        {/* RESULTS VIEW */}
        {result && quiz ? (
          <Stack spacing={2}>
            <Alert severity={result.score >= result.maxScore / 2 ? 'success' : 'warning'}>
              Score: {result.score}/{result.maxScore} • Course progress: {result.progressPct}%
            </Alert>

            <Typography variant="subtitle1">Review</Typography>
            {quiz.questions.map((q, i) => {
              const det = answerDetail.get(q.id);
              return (
                <Box
                  key={q.id}
                  sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <Typography sx={{ mb: 1 }}>
                    <b>Q{i + 1}.</b> {q.text}
                  </Typography>
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
        ) : quiz ? (
          // QUIZ FORM VIEW
          <Stack spacing={2}>
            <Typography variant="subtitle1">Quiz</Typography>
            {quiz.questions.map((q, i) => (
              <Box
                key={q.id}
                sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {i + 1}. {q.text}
                </Typography>
                <RadioGroup
                  value={answers[q.id] ?? ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
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
        ) : (
          !err && (
            <Typography variant="body2" color="text.secondary">
              This section’s video has no quiz attached.
            </Typography>
          )
        )}
      </DialogContent>

      <DialogActions>
        {!result && <Button onClick={onClose}>Close</Button>}
        {!result && quiz && (
          <Button
            variant="contained"
            onClick={submit}
            disabled={!canSubmit || submitting}
          >
            Submit
          </Button>
        )}
        {result && <Button variant="contained" onClick={onClose}>Done</Button>}
      </DialogActions>
    </Dialog>
  );
}
