// src/components/feed/CommentsDrawer.tsx
import { useEffect, useState } from 'react';
import {
  Avatar, Box, Divider, Drawer, IconButton, List, ListItem, ListItemAvatar, ListItemText,
  Stack, TextField, Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { VideosAPI } from '../../services/api';

export default function CommentsDrawer({
  open, onClose, videoId,
}: { open: boolean; onClose: ()=>void; videoId: string | null }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!open || !videoId) return;
    (async () => {
      setLoading(true);
      try { setItems(await VideosAPI.listComments(videoId, 50, 0)); }
      finally { setLoading(false); }
    })();
  }, [open, videoId]);

  async function onSend() {
    if (!videoId || !text.trim()) return;
    const t = text.trim();
    setText('');
    try {
      await VideosAPI.addComment(videoId, t);
      // naive refresh
      setItems(await VideosAPI.listComments(videoId, 50, 0));
    } catch (e) { /* show toast if you have one */ }
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 380 } }}>
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle1" sx={{ flex: 1 }}>Comments</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 1, pt: 0, flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <Typography variant="body2" sx={{ p: 2 }}>Loading…</Typography>
        ) : items.length === 0 ? (
          <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>No comments yet.</Typography>
        ) : (
          <List dense>
            {items.map((c) => (
              <ListItem key={c.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={c.author?.avatarUrl || undefined}>{(c.author?.displayName || c.author?.username || 'U')[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={c.author?.displayName || c.author?.username || 'User'}
                  secondary={
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.primary">{c.text}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(c.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      <Divider />
      <Stack direction="row" spacing={1} sx={{ p: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Add a comment"
          value={text}
          onChange={(e)=>setText(e.target.value)}
          onKeyDown={(e)=>{ if (e.key === 'Enter') onSend(); }}
        />
        <IconButton onClick={onSend} color="primary"><SendIcon /></IconButton>
      </Stack>
    </Drawer>
  );
}
