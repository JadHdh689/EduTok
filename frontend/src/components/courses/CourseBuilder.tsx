// src/components/courses/CourseBuilder.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Card, CardContent, CardHeader, Checkbox, Divider, FormControlLabel,
  IconButton, MenuItem, Stack, TextField, Typography, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';

import { CommonAPI, CoursesAPI, VideosAPI } from '../../services/api';
import FinalExamDialog from './FinalExamDialog';

type ChapterVM = {
  id?: string;
  title: string;
  order: number;
  sections: { id?: string; title: string; order: number; video?: any }[];
};

// Local type for picked video (prevents implicit-any)
type PickerVideo = {
  id: string;
  title: string;
  durationSec: number;
  description?: string | null;
};

/** Lightweight local picker that matches the { open, onClose, onSelect } API */
function LocalVideoPickerDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (video: PickerVideo) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();
  const [rows, setRows] = useState<PickerVideo[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      setErr(undefined);
      try {
        const data = await VideosAPI.listMine();
        setRows(
          (data || []).map((v: any) => ({
            id: v.id,
            title: v.title,
            durationSec: Math.round(v.durationSec || 0),
            description: v.description ?? null,
          }))
        );
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load videos');
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Select a video</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
            <CircularProgress />
            <Typography variant="body2">Loading…</Typography>
          </Stack>
        )}
        {err && <Alert severity="error">{err}</Alert>}
        {!loading && !err && rows.length === 0 && (
          <Typography variant="body2" color="text.secondary">No videos yet.</Typography>
        )}
        {!loading && !err && rows.length > 0 && (
          <Grid container spacing={2}>
            {rows.map((v) => (
              <Grid key={v.id} item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    title={<Typography noWrap>{v.title}</Typography>}
                    subheader={`${v.durationSec}s`}
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {v.description || ' '}
                    </Typography>
                  </CardContent>
                  <Button
                    startIcon={<PlayArrowIcon />}
                    sx={{ m: 1, mt: 0 }}
                    variant="contained"
                    onClick={() => onSelect(v)}
                  >
                    Use this
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function CourseBuilder({ courseId }: { courseId?: string }) {
  const navigate = useNavigate();

  // Meta
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [published, setPublished] = useState(false);

  // Structure
  const [chapters, setChapters] = useState<ChapterVM[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>();
  const [err, setErr] = useState<string>();

  // Dialogs
  const [videoPickerForChapter, setVideoPickerForChapter] = useState<string | null>(null);
  const [videoPickerForSectionOrder, setVideoPickerForSectionOrder] = useState<number | null>(null);
  const [finalExamOpen, setFinalExamOpen] = useState(false);

  // Load categories (and course if editing)
  useEffect(() => {
    (async () => {
      try {
        setErr(undefined);
        const cats = await CommonAPI.listCategories();
        setCategories(cats);

        if (courseId) {
          try {
            const c = await CoursesAPI.getPublic(courseId).catch(() => null);
            if (c) {
              setTitle(c.title);
              setCategoryId(c.category?.id ?? '');
              setDescription(c.description ?? '');
              setCoverImageUrl(c.coverImageUrl ?? '');
              setPublished(!!c.published);
              const chs: ChapterVM[] = c.chapters.map((ch: any) => ({
                id: ch.id,
                title: ch.title,
                order: ch.order,
                sections: ch.sections.map((s: any) => ({
                  id: s.id, title: s.title, order: s.order, video: s.video,
                })),
              }));
              setChapters(chs.sort((a, b) => a.order - b.order));
            }
          } catch (e: any) {
            setErr(e?.response?.data?.message || e.message || 'Failed to load course');
          }
        } else {
          // IMPORTANT: when creating, do NOT pre-add "Chapter 1".
          // Keep chapters empty; user can add chapters after the course is created.
          setChapters([]);
        }
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load categories');
      }
    })();
  }, [courseId]);

  const canSave = useMemo(() => !!title && !!categoryId, [title, categoryId]);

  async function saveMeta() {
    if (!canSave) return;
    setSaving(true);
    setErr(undefined);
    try {
      if (!courseId) {
        const { id } = await CoursesAPI.createCourse({
          title,
          categoryId: Number(categoryId),
          description: description || null,
          coverImageUrl: coverImageUrl || null,
          published,
        });
        setStatus('Course created.');
        // Immediately jump to edit mode where chapters/sections are enabled
        navigate(`/profile/courses/${id}/edit`, { replace: true });
      } else {
        await CoursesAPI.updateCourse(courseId, {
          title,
          categoryId: Number(categoryId),
          description,
          coverImageUrl,
          published,
        });
        setStatus('Course saved.');
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish() {
    if (!courseId) return;
    setSaving(true);
    setErr(undefined);
    try {
      await CoursesAPI.setPublished(courseId, !published);
      setPublished(!published);
      setStatus(!published ? 'Published' : 'Unpublished');
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Publish failed');
    } finally {
      setSaving(false);
    }
  }

  function addChapter() {
    const maxOrder = chapters.reduce((m, c) => Math.max(m, c.order), 0);
    setChapters([...chapters, { title: `Chapter ${maxOrder + 1}`, order: maxOrder + 1, sections: [] }]);
  }

  async function persistChapter(ch: ChapterVM) {
    if (!courseId || ch.id) return;
    try {
      const r = await CoursesAPI.addChapter(courseId, { title: ch.title, order: ch.order });
      ch.id = r.id;
      setChapters(chapters.map(x => x.order === ch.order ? ch : x));
    } catch {
      /* no-op */
    }
  }

  async function removeChapter(order: number) {
    const ch = chapters.find(c => c.order === order);
    if (!ch) return;
    if (ch.id) {
      try { await CoursesAPI.deleteChapter(ch.id); } catch {}
    }
    setChapters(chapters.filter(c => c.order !== order));
  }

  function addSection(chapterOrder: number) {
    const ch = chapters.find(c => c.order === chapterOrder);
    if (!ch) return;
    const maxOrder = ch.sections.reduce((m, s) => Math.max(m, s.order), 0);
    const newOrder = maxOrder + 1;
    setVideoPickerForChapter(ch.id || `temp-${chapterOrder}`);
    setVideoPickerForSectionOrder(newOrder);
  }

  async function onPickVideo(video: PickerVideo) {
    const chapterKey = videoPickerForChapter!;
    const sectionOrder = videoPickerForSectionOrder!;
    setVideoPickerForChapter(null);
    setVideoPickerForSectionOrder(null);

    const ch = chapters.find(c => (c.id ?? `temp-${c.order}`) === chapterKey);
    if (!ch) return;

    const nextSections = [...ch.sections, { title: video.title, order: sectionOrder, video }];
    const nextChapters = chapters.map(x => x.order === ch.order ? { ...ch, sections: nextSections } : x);
    setChapters(nextChapters);

    if (courseId) await persistChapter(ch);
    const chapterId = ch.id;
    if (chapterId) {
      try {
        await CoursesAPI.addSection(chapterId, { title: video.title, order: sectionOrder, videoId: video.id });
        setStatus('Section added');
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Add section failed');
      }
    }
  }

  async function removeSection(chapterOrder: number, sectionOrder: number) {
    const ch = chapters.find(c => c.order === chapterOrder);
    if (!ch) return;
    const sec = ch.sections.find(s => s.order === sectionOrder);
    if (sec?.id) {
      try { await CoursesAPI.deleteSection(sec.id); } catch {}
    }
    const nextSections = ch.sections.filter(s => s.order !== sectionOrder);
    setChapters(chapters.map(x => x.order === chapterOrder ? { ...ch, sections: nextSections } : x));
  }

  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardHeader title={courseId ? 'Edit Course' : 'Create Course'} />
        <CardContent>
          {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
          {status && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setStatus(undefined)}>{status}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Category"
                fullWidth
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={<Checkbox checked={published} onChange={(_, v) => setPublished(v)} />}
                label="Published"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline minRows={3}
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Cover image URL"
                fullWidth
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={saveMeta} disabled={!canSave || saving}>
              {courseId ? 'Save' : 'Create'}
            </Button>
            {courseId && (
              <>
                <Button
                  variant="outlined"
                  onClick={togglePublish}
                  startIcon={published ? <UnpublishedIcon /> : <PublishIcon />}
                  disabled={saving}
                >
                  {published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QuizOutlinedIcon />}
                  onClick={() => setFinalExamOpen(true)}
                  disabled={saving}
                >
                  Edit Final Exam
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* ===== Chapters & Sections ===== */}
      {!courseId ? (
        // CREATE MODE: hide chapter UI; show simple info
        <Card variant="outlined">
          <CardHeader title="Chapters" />
          <CardContent>
            <Alert severity="info">
              Create the course first, then you can add chapters and attach videos.
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card variant="outlined">
            <CardHeader
              title="Chapters"
              action={
                <Button startIcon={<AddIcon />} onClick={addChapter}>
                  Add chapter
                </Button>
              }
            />
            <CardContent>
              {!chapters.length && <Typography variant="body2">No chapters yet.</Typography>}

              {chapters
                .slice()
                .sort((a, b) => a.order - b.order)
                .map(ch => (
                  <Box key={ch.order} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <TextField
                        size="small"
                        label="Chapter title"
                        value={ch.title}
                        onChange={(e) => {
                          ch.title = e.target.value;
                          setChapters(chapters.map(x => x.order === ch.order ? { ...ch } : x));
                        }}
                        onBlur={() => persistChapter(ch)}
                        sx={{ flex: 1 }}
                      />
                      <IconButton onClick={() => removeChapter(ch.order)} color="error">
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={1}>
                      {ch.sections
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map(sec => (
                          <Box key={sec.order} sx={{ p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <TextField
                                size="small"
                                label="Section title"
                                value={sec.title}
                                onChange={(e) => {
                                  sec.title = e.target.value;
                                  setChapters(chapters.map(x => x.order === ch.order ? { ...ch } : x));
                                }}
                                sx={{ flex: 1 }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {sec.video ? `${sec.video.durationSec}s · ${sec.video?.title}` : 'No video'}
                              </Typography>
                              <IconButton onClick={() => removeSection(ch.order, sec.order)} color="error">
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Stack>
                          </Box>
                        ))}

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => addSection(ch.order)}
                      >
                        Add section (attach video)
                      </Button>
                    </Stack>
                  </Box>
                ))}
            </CardContent>
          </Card>

          {/* Pick a video for a section — only in edit mode */}
          <LocalVideoPickerDialog
            open={!!videoPickerForChapter}
            onClose={() => { setVideoPickerForChapter(null); setVideoPickerForSectionOrder(null); }}
            onSelect={onPickVideo}
          />

          {/* Manual Final Exam builder — only in edit mode */}
          <FinalExamDialog
            open={finalExamOpen}
            onClose={() => setFinalExamOpen(false)}
            courseId={courseId}
            onSaved={() => setStatus('Final exam saved.')}
          />
        </>
      )}
    </Box>
  );
}
