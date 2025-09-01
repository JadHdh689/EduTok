// ────────────────────────────────────────────────────────────────────────────
// FILE: src/components/courses/SectionPlayer.tsx
// ────────────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Box, CircularProgress, IconButton, Stack, Tooltip, Typography, Badge, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { useTheme, useMediaQuery } from '@mui/material';

import { CoursesAPI, VideosAPI } from '../../services/api';
import CommentsDrawer from '../feed/CommentsDrawer';

/* ────────────────────────────────────────────────────────────────────────────
   CourseQuizModal — shows results, persists progress, NO auto next/redirect
   ──────────────────────────────────────────────────────────────────────────── */
function CourseQuizModal({
  open, onClose, sectionId, videoId, onNext,
}: {
  open: boolean;
  onClose: () => void;
  sectionId: string;
  videoId: string;
  onNext?: () => void; // manual "Next section" after results (optional)
}) {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<{ id: string; questions: { id: string; text: string; options: { id: string; text: string }[] }[] } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string>();
  const [result, setResult] = useState<{
    score: number; maxScore: number; progressPct: number;
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
        const data = await VideosAPI.getQuiz(videoId);
        setQuiz(data.quiz ? { id: data.quiz.id, questions: data.quiz.questions } : null);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, videoId]);

  async function submit() {
    if (!quiz) return;
    const payload = quiz.questions.map(q => ({ questionId: q.id, selectedOptionId: answers[q.id] }));
    try {
      setErr(undefined);
      setLoading(true);
      const r = await CoursesAPI.submitSectionQuiz(sectionId, payload);
      setResult({ score: r.score, maxScore: r.maxScore, progressPct: r.progressPct, answers: r.answers });
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Submit failed');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !!quiz?.questions?.every(q => !!answers[q.id]);

  const answerDetail = useMemo(() => {
    const map = new Map<string, { selected?: string; correct?: string }>();
    (result?.answers || []).forEach((a) =>
      map.set(a.questionId, { selected: a.selectedOptionId, correct: a.correctOptionId })
    );
    return map;
  }, [result]);

  const handleNext = () => {
    onClose();
    onNext?.();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Quiz</DialogTitle>
      <DialogContent dividers>
        {loading && <Typography variant="body2">Loading…</Typography>}
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        {result ? (
          <Stack spacing={2}>
            <Alert severity="success">
              Score: {result.score}/{result.maxScore} · Progress: {result.progressPct}%
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
              </Stack>
            )}
          </Stack>
        ) : quiz ? (
          <Stack spacing={2}>
            {quiz.questions.map((q, i) => (
              <Box key={q.id} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography sx={{ mb: .5 }}><b>Q{i+1}.</b> {q.text}</Typography>
                <RadioGroup
                  value={answers[q.id] || ''}
                  onChange={(_, val)=> setAnswers(prev=> ({ ...prev, [q.id]: val }))}
                >
                  {q.options.map(o => (
                    <FormControlLabel key={o.id} value={o.id} control={<Radio />} label={o.text} />
                  ))}
                </RadioGroup>
              </Box>
            ))}
          </Stack>
        ) : (!loading && !err) ? (
          <Typography variant="body2" color="text.secondary">This video has no quiz.</Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        {!result && <Button onClick={onClose}>Close</Button>}
        {!result && quiz && <Button variant="contained" onClick={submit} disabled={!canSubmit || loading}>Submit</Button>}
        {result && (
          <>
            <Button onClick={onClose}>Done</Button>
            {onNext && <Button variant="contained" onClick={handleNext}>Next section</Button>}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   SectionPlayer (responsive)
   ──────────────────────────────────────────────────────────────────────────── */
type SectionPlayerProps = {
  courseTitle: string;
  chapterTitle: string;
  section: {
    id: string;
    title: string;
    order: number;
    video: { id: string; title: string; durationSec: number };
  };
  onBack: () => void;
  onNext?: () => void;
};

export default function SectionPlayer({
  courseTitle, chapterTitle, section, onBack, onNext,
}: SectionPlayerProps) {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));
  const downMd = useMediaQuery(theme.breakpoints.down('md'));

  // UI chrome sizes (slightly smaller on phones)
  const UI = {
    TOP: downSm ? 52 : 56,
    BOTTOM: downSm ? 84 : 110,
    RIGHT_STACK_GAP: 16,
  };

  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number | null>(null);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ✅ Guard: only trigger quiz once per section/video end
  const endedOnceRef = useRef(false);

  const openQuiz = () => {
    setPaused(true);          // pause background video
    setQuizOpen(true);
  };

  const closeQuiz = () => {
    setQuizOpen(false);
    endedOnceRef.current = true; // prevent re-open from onEnded after closing
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(undefined);
      setPlayUrl(null);
      setProgress(0);
      endedOnceRef.current = false;   // reset guard when video changes
      try {
        const [{ url }, full] = await Promise.all([
          VideosAPI.streamUrl(section.video.id),
          VideosAPI.get(section.video.id).catch(() => ({} as any)),
        ]);
        setPlayUrl(url);
        setPaused(false);
        const serverLikes =
          typeof full?.likesCount === 'number'
            ? full.likesCount
            : typeof full?._count?.likes === 'number'
            ? full._count.likes
            : null;
        setLikesCount(serverLikes ?? null);
        setLiked(!!full?.likedByMe);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load video');
      } finally {
        setLoading(false);
      }
    })();
  }, [section.video.id]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, playUrl]);

  const duration = useMemo(
    () => videoRef.current?.duration || section.video.durationSec || 0,
    [section.video.durationSec, playUrl]
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setProgress(v.currentTime || 0);
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, [playUrl]);

  const onSeek = (secs: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(secs, v.duration || secs));
    setProgress(v.currentTime);
  };

  async function toggleLike() {
    const wantLike = !liked;
    const nextCount = typeof likesCount === 'number' ? likesCount + (wantLike ? 1 : -1) : null;
    setLiked(wantLike);
    if (nextCount !== null) setLikesCount(nextCount);
    try { wantLike ? await VideosAPI.like(section.video.id) : await VideosAPI.unlike(section.video.id); }
    catch {
      const reverted = typeof likesCount === 'number' ? likesCount + (wantLike ? -1 : 1) : null;
      setLiked(!wantLike);
      if (reverted !== null) setLikesCount(reverted);
    }
  }

  // Responsive video sizing
  const videoSize = downSm
    ? { maxWidth: '100%', maxHeight: '100%' }
    : downMd
    ? { maxWidth: '70%', maxHeight: '75%' }
    : { maxWidth: '60%', maxHeight: '80%' };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        bgcolor: 'black',
        overflow: 'hidden',
        pt: `max(${UI.TOP}px, env(safe-area-inset-top, 0px))`,
        pb: `max(${UI.BOTTOM}px, env(safe-area-inset-bottom, 0px))`,
      }}
    >
      {/* Top bar */}
      <Box sx={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: UI.TOP,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 1.5,
        bgcolor: 'rgba(0,0,0,0.25)',
        zIndex: 2,
        backdropFilter: 'blur(4px)',
        pt: 'env(safe-area-inset-top, 0px)',
      }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Tooltip title="Back to outline">
            <IconButton onClick={onBack} sx={{ color: '#fff' }} size={downSm ? 'small' : 'medium'}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography sx={{ color: '#fff', fontWeight: 700 }} noWrap>
            {courseTitle}
          </Typography>
          <Typography sx={{ color: '#bbb' }} noWrap component="span">
            &nbsp;·&nbsp;{chapterTitle}
          </Typography>
        </Stack>
        <Typography sx={{ color: '#fff', ml: 2 }} noWrap>
          {section.title}
        </Typography>
      </Box>

      {/* Video area */}
      <Box sx={{
        position: 'absolute',
        top: UI.TOP,
        bottom: UI.BOTTOM,
        left: 0, right: 0,
        overflow: 'hidden',
      }}>
        <Box
          onClick={() => setPaused((p) => !p)}
          sx={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '100%', maxHeight: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            px: downSm ? 1 : 0,
          }}
        >
          {err && <Alert severity="error">{err}</Alert>}
          {!err && loading && <CircularProgress sx={{ color: '#fff' }} />}

          {!loading && playUrl && (
            <video
              key={playUrl}
              ref={videoRef}
              src={playUrl}
              autoPlay
              muted={muted}
              playsInline
              preload="auto"
              onEnded={() => {
                // ✅ only open once automatically
                if (!endedOnceRef.current) {
                  endedOnceRef.current = true;
                  openQuiz();
                }
              }}
              style={{
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                ...videoSize,
              }}
            />
          )}
        </Box>
      </Box>

      {/* Right controls */}
      <Stack
        spacing={downSm ? 1 : 2}
        sx={{
          position: 'absolute',
          right: 12,
          bottom: UI.BOTTOM + (downSm ? 8 : 16),
          zIndex: 3,
          alignItems: 'center'
        }}
      >
        <Tooltip title={paused ? 'Play' : 'Pause'}>
          <IconButton
            onClick={() => setPaused((p) => !p)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
            size={downSm ? 'small' : 'medium'}
          >
            {paused ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={liked ? 'Unlike' : 'Like'}>
          <Badge badgeContent={typeof likesCount === 'number' ? likesCount : undefined} color="error">
            <IconButton
              onClick={toggleLike}
              sx={{ color: liked ? '#ff3b5c' : '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
              size={downSm ? 'small' : 'medium'}
            >
              <FavoriteBorderIcon />
            </IconButton>
          </Badge>
        </Tooltip>

        <Tooltip title="Comments">
          <IconButton
            onClick={() => setCommentsOpen(true)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
            size={downSm ? 'small' : 'medium'}
          >
            <ChatBubbleOutlineIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={muted ? 'Unmute' : 'Mute'}>
          <IconButton
            onClick={() => setMuted((m) => !m)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
            size={downSm ? 'small' : 'medium'}
          >
            {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Take quiz">
          <IconButton
            onClick={openQuiz}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
            size={downSm ? 'small' : 'medium'}
          >
            <QuizOutlinedIcon />
          </IconButton>
        </Tooltip>

        {onNext && (
          <Tooltip title="Next">
            <IconButton
              onClick={onNext}
              sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' }}
              size={downSm ? 'small' : 'medium'}
            >
              <SkipNextIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Bottom bar */}
      <Box
        sx={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: UI.BOTTOM,
          p: downSm ? 1.5 : 2,
          zIndex: 3,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 35%, rgba(0,0,0,.85) 100%)',
          pb: `max(${downSm ? 10 : 16}px, env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <Typography sx={{ color: '#fff', fontWeight: 600 }} className="truncate">
          {section.video.title}
        </Typography>
        <Typography sx={{ color: '#ddd' }} className="truncate">
          {chapterTitle} · {section.title}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ color: '#ccc', minWidth: 42 }} variant="caption">
            {Math.floor(progress)}s
          </Typography>
          <input
            type="range"
            min={0}
            max={Math.max(1, duration || 1)}
            value={progress}
            onChange={(e) => onSeek(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        <Typography sx={{ color: '#ccc', minWidth: 42, textAlign: 'right' }} variant="caption">
            {Math.floor(duration || 0)}s
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            size={downSm ? 'small' : 'medium'}
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={<QuizOutlinedIcon />}
            onClick={openQuiz}
            size={downSm ? 'small' : 'medium'}
          >
            Take quiz to continue
          </Button>
          {onNext && (
            <Button
              variant="text"
              onClick={onNext}
              size={downSm ? 'small' : 'medium'}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Skip to next
            </Button>
          )}
        </Stack>
      </Box>

      {/* Drawers / Quiz */}
      <CommentsDrawer open={commentsOpen} onClose={() => setCommentsOpen(false)} videoId={section.video.id} />
      <CourseQuizModal
        open={quizOpen}
        onClose={closeQuiz}     // ✅ mark endedOnce so it won't reopen
        sectionId={section.id}
        videoId={section.video.id}
        onNext={onNext}
      />
    </Box>
  );
}
