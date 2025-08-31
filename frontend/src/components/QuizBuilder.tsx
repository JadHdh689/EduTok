//src/components/QuizBuilder.tsx
import * as React from 'react';
import { Box, Button, Card, CardContent, Grid, IconButton, TextField, Typography, Radio } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export interface QuizOption { text: string; correct?: boolean }
export interface QuizQuestion { text: string; options: QuizOption[] }
export interface QuizBuilderValue { questions: QuizQuestion[] }

export default function QuizBuilder(props: {
  value: QuizBuilderValue;
  onChange: (v: QuizBuilderValue)=>void;
}) {
  const { value, onChange } = props;

  function setQuestion(i: number, q: QuizQuestion) {
    const next = [...value.questions];
    next[i] = q;
    onChange({ questions: next });
  }
  function addQuestion() {
    onChange({ questions: [...value.questions, { text: '', options: [{text:''},{text:''}] }] });
  }
  function removeQuestion(i: number) {
    const next = value.questions.filter((_, idx)=>idx!==i);
    onChange({ questions: next });
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Quiz (min 3 questions, exactly one correct per question)</Typography>
      <Grid container spacing={2}>
        {value.questions.map((q, i)=>(
          <Grid item xs={12} key={i}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    fullWidth
                    label={`Question ${i+1}`}
                    value={q.text}
                    onChange={(e)=>setQuestion(i, { ...q, text: e.target.value })}
                  />
                  <IconButton onClick={()=>removeQuestion(i)} aria-label="remove question">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Box mt={2} display="flex" flexDirection="column" gap={1}>
                  {q.options.map((opt, j)=>(
                    <Box key={j} display="flex" alignItems="center" gap={1}>
                      <Radio
                        checked={!!opt.correct}
                        onChange={()=> {
                          const opts = q.options.map((o, idx)=>({ ...o, correct: idx===j }));
                          setQuestion(i, { ...q, options: opts });
                        }}
                      />
                      <TextField
                        fullWidth
                        label={`Option ${j+1}`}
                        value={opt.text}
                        onChange={(e)=> {
                          const opts = [...q.options];
                          opts[j] = { ...opts[j], text: e.target.value };
                          setQuestion(i, { ...q, options: opts });
                        }}
                      />
                      <IconButton
                        onClick={()=> {
                          const opts = q.options.filter((_, idx)=>idx!==j);
                          setQuestion(i, { ...q, options: opts.length ? opts : [{text:''},{text:''}] });
                        }}
                        disabled={q.options.length <= 2}
                        aria-label="remove option"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button size="small" onClick={()=> setQuestion(i, { ...q, options: [...q.options, { text:'' }] })}>
                    Add option
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button onClick={addQuestion}>Add question</Button>
        </Grid>
      </Grid>
    </Box>
  );
}
