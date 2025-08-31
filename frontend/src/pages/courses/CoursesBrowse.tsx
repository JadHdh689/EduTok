import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CommonAPI, CoursesAPI } from '../../services/api';

type Mode = 'all' | 'enrolled';

export default function CoursesBrowse() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // URL-backed state
  const [mode, setMode] = useState<Mode>((params.get('mode') as Mode) || 'all');
  const [q, setQ] = useState(params.get('q') ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(
    params.get('categoryId') ? Number(params.get('categoryId')) : ''
  );

  // data
  const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [items, setItems] = useState<any[]>([]);            // list for "all"
  const [enrollments, setEnrollments] = useState<any[]>([]); // list for "enrolled"
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();

  // persist to URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (mode && mode !== 'all') next.set('mode', mode);
    if (q) next.set('q', q);
    if (categoryId) next.set('categoryId', String(categoryId));
    setParams(next, { replace: true });
  }, [mode, q, categoryId, setParams]);

  // load categories once
  useEffect(() => {
    (async () => {
      try {
        const catList = await CommonAPI.listCategories();
        setCats(catList);
      } catch {
        // silent; categories are optional for UI
      }
    })();
  }, []);

  // load data when mode/search/filter changes
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(undefined);
      try {
        if (mode === 'all') {
          const list = await CoursesAPI.browse({
            q: q || undefined,
            categoryId: categoryId ? Number(categoryId) : undefined,
            take: 24,
            skip: 0,
          });
          setItems(list);
        } else {
          // enrolled: fetch my enrollments; we'll filter client-side with q/category
          const list = await CoursesAPI.listMyEnrollments();
          setEnrollments(list);
        }
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, q, categoryId]);

  // derived display list
  const display = useMemo(() => {
    if (mode === 'all') return items;

    // map enrollments -> course objects and attach enrollment meta
    const mapped = enrollments.map((enr) => ({
      ...enr.course,
      _enrollment: { progressPct: enr.progressPct, status: enr.status },
    }));

    // text filter (title or author name)
    const text = q.trim().toLowerCase();
    let filtered = mapped;
    if (text) {
      filtered = filtered.filter((c: any) => {
        const authorName = (c.author?.displayName || c.author?.username || '').toLowerCase();
        return c.title.toLowerCase().includes(text) || authorName.includes(text);
      });
    }

    // category filter
    if (categoryId) {
      filtered = filtered.filter((c: any) => c.category?.id === Number(categoryId));
    }

    return filtered;
  }, [mode, enrollments, items, q, categoryId]);

  const canClear = useMemo(() => !!q || !!categoryId || mode !== 'all', [q, categoryId, mode]);

  return (
    <Box sx={{ px: 2, py: 3 }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', lg: 'center' }}
        sx={{ mb: 2 }}
      >
        <ToggleButtonGroup
          exclusive
          value={mode}
          onChange={(_, v: Mode | null) => v && setMode(v)}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="enrolled">Enrolled</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          placeholder={mode === 'all' ? 'Search by course or instructor…' : 'Search your courses…'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 260 }}
        />

        <TextField
          select
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
          sx={{ width: 220 }}
        >
          <MenuItem value="">All</MenuItem>
          {cats.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        {canClear && (
          <Button
            onClick={() => {
              setMode('all');
              setQ('');
              setCategoryId('');
            }}
          >
            Clear
          </Button>
        )}
      </Stack>

      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      {loading ? (
        <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
          <CircularProgress />
          <Typography variant="body2">
            {mode === 'all' ? 'Loading courses…' : 'Loading your enrollments…'}
          </Typography>
        </Stack>
      ) : !display.length ? (
        <Typography variant="body2">
          {mode === 'all' ? 'No courses found.' : 'You have no enrolled courses yet.'}
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {display.map((c: any) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={c.id}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea onClick={() => navigate(`/courses/${c.id}`)} sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      height: 140,
                      bgcolor: 'grey.100',
                      backgroundImage: c.coverImageUrl ? `url(${c.coverImageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle1" noWrap title={c.title}>
                        {c.title}
                      </Typography>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {(c.author?.displayName || c.author?.username || '?')[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {c.author?.displayName || c.author?.username}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip size="small" label={c.category?.name ?? 'General'} variant="outlined" />
                        {mode === 'all' ? (
                          typeof c?._count?.enrollments === 'number' && (
                            <Chip size="small" icon={<SchoolIcon />} label={`${c._count.enrollments}`} />
                          )
                        ) : (
                          c?._enrollment && (
                            <Chip
                              size="small"
                              color={c._enrollment.status === 'COMPLETED' ? 'success' : 'primary'}
                              icon={c._enrollment.status === 'COMPLETED' ? <CheckCircleIcon /> : undefined}
                              label={
                                c._enrollment.status === 'COMPLETED'
                                  ? 'Completed'
                                  : `${c._enrollment.progressPct}%`
                              }
                            />
                          )
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
