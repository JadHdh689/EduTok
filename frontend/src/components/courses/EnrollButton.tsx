import { useState } from 'react';
import { Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';
import { CoursesAPI } from '../../services/api';

export default function EnrollButton({
  courseId,
  initiallyEnrolled = false,
  onEnrolled,
  onContinue,
}: {
  courseId: string;
  initiallyEnrolled?: boolean;
  onEnrolled?: (enrollment: { progressPct: number }) => void;
  onContinue?: () => void; // <— NEW
}) {
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(initiallyEnrolled);

  async function enroll() {
    if (enrolled || enrolling) return;
    setEnrolling(true);
    try {
      const r = await CoursesAPI.enroll(courseId);
      setEnrolled(true);
      onEnrolled?.({ progressPct: r.progressPct });
    } catch (e) {
      // optional toast
    } finally {
      setEnrolling(false);
    }
  }

  if (enrolled) {
    return (
      <Button
        variant="contained"
        color="success"
        startIcon={<PlayArrowIcon />}
        disableElevation
        onClick={onContinue} // <— actually do something
      >
        Continue
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      startIcon={<SchoolIcon />}
      onClick={enroll}
      disabled={enrolling}
    >
      {enrolling ? 'Enrolling…' : 'Enroll'}
    </Button>
  );
}
