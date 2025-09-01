import { Fragment } from 'react';
import {
  Box, Stack, TextField, IconButton, Button, Typography,
  RadioGroup, FormControlLabel, Radio, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export type QuizOption = { text: string; correct?: boolean };
export type QuizQuestion = { text: string; options: QuizOption[] };
export type QuizBuilderValue = { questions: QuizQuestion[] };

export default function QuizBuilder({
  value,
  onChange,
}: {
  value: QuizBuilderValue;
  onChange: (v: QuizBuilderValue) => void;
}) {
  const qs = value.questions ?? [];

  const setQ = (index: number, updater: (q: QuizQuestion) => QuizQuestion) => {
    const next = qs.map((q, i) => (i === index ? updater(q) : q));
    onChange({ questions: next });
  };

  const addQ = () =>
    onChange({
      questions: [
        ...qs,
        { text: '', options: [{ text: '', correct: true }, { text: '' }] },
      ],
    });

  const rmQ = (index: number) =>
    onChange({ questions: qs.filter((_, i) => i !== index) });

  const addOpt = (qi: number) =>
    setQ(qi, (q) => ({ ...q, options: [...q.options, { text: '' }] }));

  const rmOpt = (qi: number, oi: number) =>
    setQ(qi, (q) => ({ ...q, options: q.options.filter((_, i) => i !== oi) }));

  const setOptCorrect = (qi: number, oi: number) =>
    setQ(qi, (q) => ({
      ...q,
      options: q.options.map((o, i) => ({ ...o, correct: i === oi })),
    }));

  const setOptText = (qi: number, oi: number, t: string) =>
    setQ(qi, (q) => ({
      ...q,
      options: q.options.map((o, i) => (i === oi ? { ...o, text: t } : o)),
    }));

  return (
    <Stack spacing={2}>
      {qs.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Add at least 3 questions.
        </Typography>
      )}

      {qs.map((q, i) => {
        const correctIndex = Math.max(0, q.options.findIndex((o) => o.correct) ?? 0);
        return (
          <Box
            key={i}
            sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label={`Question ${i + 1}`}
                value={q.text}
                onChange={(e) => setQ(i, (prev) => ({ ...prev, text: e.target.value }))}
                sx={{ flex: 1 }}
              />
              <IconButton onClick={() => rmQ(i)} color="error">
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <RadioGroup
              value={String(correctIndex)}
              onChange={(_, val) => setOptCorrect(i, Number(val))}
            >
              <Stack spacing={1}>
                {q.options.map((o, oi) => (
                  <Fragment key={oi}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FormControlLabel
                        value={String(oi)}
                        control={<Radio />}
                        label=""
                        sx={{ m: 0 }}
                      />
                      <TextField
                        size="small"
                        label={`Option ${oi + 1}`}
                        value={o.text}
                        onChange={(e) => setOptText(i, oi, e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <IconButton size="small" onClick={() => rmOpt(i, oi)} color="error">
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Fragment>
                ))}
              </Stack>
            </RadioGroup>

            <Button
              size="small"
              startIcon={<AddIcon />}
              sx={{ mt: 1 }}
              onClick={() => addOpt(i)}
            >
              Add option
            </Button>
          </Box>
        );
      })}

      <Button startIcon={<AddIcon />} onClick={addQ}>
        Add question
      </Button>
    </Stack>
  );
}
