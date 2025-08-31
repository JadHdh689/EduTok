// FILE: src/components/profile/VideoUploadForm.tsx
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LoadingButton from '../LoadingButton';
import { CommonAPI, VideosAPI } from '../../services/api';
import { uploadToS3 } from '../../utils/uploadtoS3';

type QuizOption = { text: string; correct?: boolean };
type QuizQuestion = { text: string; options: QuizOption[] };

const emptyQuestion = (): QuizQuestion => ({
  text: '',
  options: [{ text: '', correct: true }, { text: '' }, { text: '' }, { text: '' }],
});

export default function VideoUploadForm({ onUploaded }: { onUploaded?: () => void }) {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [durationSec, setDurationSec] = useState<number>(0);

  // ✅ Correct type: array of QuizQuestion (no casts)
  const [quiz, setQuiz] = useState<QuizQuestion[]>([
    emptyQuestion(),
    emptyQuestion(),
    emptyQuestion(),
  ]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        const cats = await CommonAPI.listCategories();
        setCategories(cats);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load categories');
      }
    })();
  }, []);

  // derive duration from selected file
  useEffect(() => {
    if (!file) {
      setDurationSec(0);
      return;
    }
    const url = URL.createObjectURL(file);
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.src = url;
    el.onloadedmetadata = () => {
      const d = Math.round(el.duration || 0);
      setDurationSec(Number.isFinite(d) ? d : 0);
      URL.revokeObjectURL(url);
    };
    el.onerror = () => {
      setDurationSec(0);
      URL.revokeObjectURL(url);
    };
  }, [file]);

  function setCorrectOption(qi: number, oi: number) {
    setQuiz((prev) =>
      prev.map((q, idx) =>
        idx !== qi
          ? q
          : { ...q, options: q.options.map((o, j) => ({ ...o, correct: j === oi })) }
      )
    );
  }

  function validate(): string | null {
    if (!title.trim()) return 'Title is required';
    if (!categoryId) return 'Category is required';
    if (!file) return 'Please pick a video file';
    if (durationSec <= 0) return 'Unable to read video duration';
    if (durationSec > 90) return 'Video must be 90 seconds or less';
    if (quiz.length < 3) return 'At least 3 questions are required';
    for (const q of quiz) {
      if (!q.text.trim()) return 'All questions need text';
      if ((q.options || []).length < 2) return 'Each question must have at least 2 options';
      const corrects = q.options.filter((o) => o.correct === true).length;
      if (corrects !== 1) return 'Each question must have exactly one correct option';
      for (const o of q.options) {
        if (!o.text.trim()) return 'All options need text';
      }
    }
    return null;
  }

  async function onSubmit() {
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setErr(undefined);
    setLoading(true);
    try {
      // 1) Presign
      const presign = await VideosAPI.presignUpload(
        file!.name,
        file!.type || 'application/octet-stream'
      );

      // 2) Upload to S3 (handles POST or PUT styles)
      const s3Key = await uploadToS3(presign, file!);

      // 3) Create video record + quiz (send isCorrect to backend)
      await VideosAPI.create({
        title: title.trim(),
        categoryId: categoryId as number,
        description: desc.trim() || undefined,
        s3Key,
        durationSec,
        quiz: quiz.map((q) => ({
          text: q.text.trim(),
          options: q.options.map((o) => ({
            text: o.text.trim(),
            isCorrect: !!o.correct,
          })),
        })),
      });

      onUploaded?.();
      // reset
      setTitle('');
      setDesc('');
      setFile(null);
      setDurationSec(0);
      setQuiz([emptyQuestion(), emptyQuestion(), emptyQuestion()]);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack spacing={3}>
      {err && <Alert severity="error">{err}</Alert>}

      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
      <TextField
        label="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        fullWidth
        multiline
        minRows={2}
      />

      <TextField
        select
        label="Category"
        value={categoryId}
        onChange={(e) => setCategoryId(Number(e.target.value))}
        fullWidth
      >
        {categories.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      <Stack spacing={1}>
        <input
          id="video-file"
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {durationSec > 0 && (
          <Typography
            variant="caption"
            color={durationSec > 90 ? 'error' : 'text.secondary'}
          >
            Duration: {durationSec}s {durationSec > 90 && '(exceeds 90s)'}
          </Typography>
        )}
      </Stack>

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Quiz (min 3 questions)
        </Typography>
        <Stack spacing={2}>
          {quiz.map((q, qi) => (
            <Box
              key={qi}
              sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <TextField
                label={`Question ${qi + 1}`}
                value={q.text}
                onChange={(e) =>
                  setQuiz((prev) => prev.map((qq, i) => (i === qi ? { ...qq, text: e.target.value } : qq)))
                }
                fullWidth
                sx={{ mb: 2 }}
              />
              <Grid container spacing={1}>
                {q.options.map((o, oi) => (
                  <Grid item xs={12} sm={6} key={oi}>
                    <TextField
                      label={`Option ${oi + 1}${o.correct ? ' (correct)' : ''}`}
                      value={o.text}
                      onChange={(e) =>
                        setQuiz((prev) =>
                          prev.map((qq, i) =>
                            i === qi
                              ? {
                                  ...qq,
                                  options: qq.options.map((oo, j) =>
                                    j === oi ? { ...oo, text: e.target.value } : oo
                                  ),
                                }
                              : qq
                          )
                        )
                      }
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="Mark as correct">
                            <IconButton size="small" onClick={() => setCorrectOption(qi, oi)} sx={{ ml: 1 }}>
                              {o.correct ? (
                                <CheckCircleIcon color="success" fontSize="small" />
                              ) : (
                                <RadioButtonUncheckedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        ),
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}

          <Stack direction="row" spacing={1}>
            <LoadingButton variant="contained" loading={loading} onClick={onSubmit}>
              Upload Video
            </LoadingButton>
            <LoadingButton
              variant="outlined"
              loading={false}
              onClick={() => setQuiz((prev) => [...prev, emptyQuestion()])}
            >
              Add Question
            </LoadingButton>
            {quiz.length > 3 && (
              <LoadingButton
                variant="text"
                loading={false}
                onClick={() => setQuiz((prev) => prev.slice(0, prev.length - 1))}
              >
                Remove Last
              </LoadingButton>
            )}
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
