//src//pages/fyp/FypPage.tsx
import { Box } from '@mui/material';
import FypViewer from '../../components/feed/FypViewer';

export default function FypPage() {
  return (
    <Box sx={{ height: '100vh', width: '100%', overflow: 'hidden' }}>
      <FypViewer />
    </Box>
  );
}
