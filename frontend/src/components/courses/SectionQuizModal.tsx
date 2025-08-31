// src/component/courses/SectionQuizModal.tsx
import { useEffect, useRef, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { CoursesAPI, VideosAPI } from '../../services/api';

type Props = {
  open: boolean;
  onClose: () => void;
  videoUrl: string | null;
  section: any | null; // { id, title, video: { id } }
};

/**
 * Minimal flow:
 * 1) Plays the section video (muted=false like FYP tweak)
 * 2) Loads quiz from video (via /videos/:id/quiz) just to get questions/options
 * 3) Submits through /courses/submit-section-quiz to affect progress
 */
export default function SectionQuizModal({ open, onClose, videoUrl, section }: Props) {
  const vref = useRef<HTMLVideoElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [quiz, setQuiz] = useState<{ id: string; questions: { id: string; text: string; options: { id: string; text: string }[] }[] } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; maxScore: number; progressPct: number } | null>(null);

  useEffect(() => {
    if (!open || !section?.video?.id) return;
    (async () => {
      try {
        const data = await VideosAPI.getQuiz(section.video.id);
        if (data.quiz) {
          setQuiz({ id: data.quiz.id, questions: data.quiz.questions });
        } else {
          setQuiz(null);
        }
      } catch {
        setQuiz(null);
      }
    })();
  }, [open, section?.video?.id]);

  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, videoUrl]);

  async function submit() {
    if (!section?.id || !quiz) return;
    const payload = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answers[q.id],
    }));
    setSubmitting(true);
    try {
      const r = await CoursesAPI.submitSectionQuiz(section.id, payload);
      setResult({ score: r.score, maxScore: r.maxScore, progressPct: r.progressPct });
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = quiz && quiz.questions.every((q) => !!answers[q.id]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{section?.title ?? 'Section'}</DialogTitle>
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
                muted={false}      // default unmuted like your FYP tweak
                playsInline
                preload="auto"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </Box>
          </Box>
        )}

        {result ? (
          <Stack spacing={1}>
            <Typography variant="subtitle1">Great job!</Typography>
            <Typography variant="body2">
              Score: {result.score}/{result.maxScore} · Course progress: {result.progressPct}%
            </Typography>
          </Stack>
        ) : quiz ? (
          <Stack spacing={2}>
            <Typography variant="subtitle1">Quiz</Typography>
            {quiz.questions.map((q, i) => (
              <Box key={q.id} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>{i + 1}. {q.text}</Typography>
                <RadioGroup
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                >
                  {q.options.map((o) => (
                    <FormControlLabel key={o.id} value={o.id} control={<Radio />} label={o.text} />
                  ))}
                </RadioGroup>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            This section’s video has no quiz attached.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!result && quiz && (
          <Button variant="contained" onClick={submit} disabled={!canSubmit || submitting}>
            Submit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
