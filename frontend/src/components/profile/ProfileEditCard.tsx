// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/profile/ProfileEditCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Alert, Stack, TextField } from '@mui/material';
import LoadingButton from '../LoadingButton';
import { ProfileAPI } from '../../services/api';

export default function ProfileEditCard({
  me,
  onSaved,
}: {
  me: any;
  onSaved?: () => void;
}) {
  const [displayName, setDisplayName] = useState(me?.displayName || '');
  const [bio, setBio] = useState(me?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(me?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();

  async function onSubmit() {
    setErr(undefined);
    setLoading(true);
    try {
      await ProfileAPI.update({ displayName, bio, avatarUrl });
      onSaved?.();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack spacing={2}>
      {err && <Alert severity="error">{err}</Alert>}
      <TextField
        label="Display name"
        value={displayName}
        onChange={(e)=>setDisplayName(e.target.value)}
        fullWidth
      />
      <TextField
        label="Bio"
        value={bio}
        onChange={(e)=>setBio(e.target.value)}
        fullWidth
        multiline minRows={3}
      />
      <TextField
        label="Avatar URL"
        value={avatarUrl}
        onChange={(e)=>setAvatarUrl(e.target.value)}
        fullWidth
        placeholder="https://..."
      />
      <LoadingButton variant="contained" loading={loading} onClick={onSubmit}>
        Save
      </LoadingButton>
    </Stack>
  );
}
